This is a stand-alone implementation of a React calculator. There are two branches in this repository (`main` and `aws`). You are currently in the `aws` branch.

Since you are reading this README file, this means you are in the `aws` branch. If you want to return to the stand-alone React calculation, issue the `git checkout main` command.

## Installing modules for `aws`

To properly install everything, do the following

```bash
npm install
```

Then to launch, type

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

![Enhanced GUI](enhanced-gui.png)

Now when you run, you will see a set of constants that are loaded up from the AWS backend. When you create a constant, it becomes visible to anyone that has access to that same API.

If you want to see the status of your local repository, you can type `git branch -a` again. This time, you will see the following:

```
* aws
  main
  remotes/origin/HEAD -> origin/main
  remotes/origin/aws
  remotes/origin/main
```

The asterisk shows that you are on the `aws` branch, though you also have the `main` branch locally available if you would like to continue working on it.

## Lambda Functions, explained

There are four lambda functions contained in this project:

* add -- Adds two values together, whether numbers or constants that have been defined
* list -- Returns the list of all constants
* create -- Create a new constant. Once 30 constants exist, no more can be created.
* delete -- Delete an existing constant.

Each lambda function is defined in a `index.mjs` file that contains a handler to a REST-based API invocation.

```
import mysql from 'mysql'

export const handler = async (event) => {
  
  // get credentials from the db_access layer (loaded separately via AWS console)
  var pool = mysql.createPool({
      host: "<EndPoint from RDS dashboard>",
      user: "<User>",
      password: "<Password Credentials>",
      database: "<Database Schema>"
  });
  
  ...
}
```

Note that this is a quick-and-dirty way to connect a lambda function to the RDS. There are inherent weaknesses with this approach, namely that it includes username and password credentials in source code -- a definite problem. Still, as a quick demonstration, it gets the job done.

Within the handler function, there are blocks of code that access the RDS. Please follow this idiom because it works and I can help when you encounter problems.

The block below, for example, will retrieve all constants from the Constants table.

```
  let ListConstants = () => {
      return new Promise((resolve, reject) => {
          pool.query("SELECT * FROM Constants", [], (error, rows) => {
              if (error) { return reject(error); }
              return resolve(rows);
          })
      })
  }
```

To access the returned values, you have to `await` the result, which essentially blocks until the asynchronous call completes.

```
const all_constants = await ListConstants()
```

The final step is to craft an HTTP response as a JSON payload.

Each interface end-point has the potential to be a different structure. Please try to design a consistent API so you do not have lots of special cases. Below is one response:

```
const response = {
    statusCode: 200,
    constants: all_constants
}
```

The `statusCode` is either a 200- or a 400-series response, determining the overall success or failure of a REST-base API invocation. Should there be a failure, you should include an `error` field.

## Lambda Functions in AWS Console

Be sure to configure your Lambda Functions to execute within a VPC, specifically the one that was created because of the RDS. Follow instructions on AWS for how to do this.


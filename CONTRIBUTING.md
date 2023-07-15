# Contributing

## Process

### If you want to add functionality, signal or fix a bug :

1. Create an issue explaining what you want to do or what is wrong.
2. You than can create a pull request with your changes, and link the issue to it. 

## Testing your changes in an external app

You have made some changes to the code and you want to test them
in your app before submitting a pull request ?

### 1.The project is build with pnpm, so you will need it

### 2. On your local machine, go to the `shared-routes` directory (where you cloned the project) and run :
```sh
pnpm make-lib-linkable
```
This will build the library and make it linkable (we need create and edit a package.json: This is required because of: https://github.com/garronej/ts-ci/blob/c0e207b9677523d4ec97fe672ddd72ccbb3c1cc4/README.md?plain=1#L54-L58).

### 3. If you want automatic updates of the library in your app, you can run (still in the lib directory) :
```sh
pnpm watch
```
It will run the build with `tsc` in watch mode (for 'esm' and 'cjs')

### 4. Go to your app directory (the app consuming `shared-routes`) and run :
```sh
pnpm link ../path-to-shared-routes-lib/dist
```
This will create a symlink to the shared-routes library dist in your app's `node_modules` directory.

### 5. When your are done testing, you can unlink the library (from app directory) by running :
```sh
pnpm unlink # I wish it was so easy

# Actually unlinking did not work correctly for me. So I had to reinstall the library with :
pnpm install shared-routes@library
# Hopefully I will find a better way to do this
 
```

## Releasing

For releasing a new version on GitHub and NPM you don't need to create a tag.  
Just update the `package.json` version number and push.

For publishing a release candidate update your `package.json` with `1.3.4-rc.0` (`.1`, `.2`, ...).  
It also work if you do it from a branch that have an open PR on main.

> Make sure your have defined the `NPM_TOKEN` repository secret or NPM publishing will fail.

The lib was originaly build on this repository : https://github.com/JeromeBu/shared-routes-legacy
The organisation has been changed and improve in this repo.

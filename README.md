# SSMS Template to Azure Data Studio snippets migration

This tool migrate all SSMS template to Azure Data Studio snippet format.

The default folder of SSMS Template is
`C:\Users\${user}\AppData\Roaming\Microsoft\SQL Server Management Studio\18.0\Templates\Sql`

The default folder of Azure Data Studio user snippet is
`C:\Users\<yourname>\AppData\Roaming\azuredatastudio\User\snippets`

## Requirements

- NodeJS >= 12
- Sql Server Management Studio >= 18.0

## Run

- Clone this repository
- Open a command prompt into the cloned dir
- Install node packages `npm install`
- Open `main.js` and change the variable value `const user = "john";` with your name
- Launch the app `node .\main.js`
- Check the Azure Data Studio folder snippet

## Result

If you don't have any custom template on SSMS and you don't want to waste your time, you can check the _result_ folder were there are the SSMS standard snippets already migrated.

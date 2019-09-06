# Youtube Analytics Api Integration
The following repo show basic integration and use of Youtube analytics APIs with OAuth.

 - Sample ready to get channel all videos get views, average watch time etc.

## Getting Started
You can download this repo or clone using below command. (folder-name will be project folder in which you want to start your project).
```
git clone https://github.com/binitghetiya/youtube-analytics-api.git <folder-name>
```
or from **Download Zip**
```
https://github.com/binitghetiya/youtube-analytics-api 
```
### Project Setup
Once you clone or download project go into you folder

>now run **npm install** or **yarn install** in your project folder

>now cope **example.oauth2.keys.json** file to **oauth2.keys.json** file

>Create OAuth app from (https://console.developers.google.com) and update client_id, project_id, client_secret etc in **oauth2.keys.json**

### Generate token with offline access
> now run **npm run tokens** this will open permission window in your browser and will ask for permission.

>Once done it will create one file **youtube-API-secrets.json** in your secrets folder, this file will contain an access token that you can use to call an API.

>Here we are requesting **offline** token so you don't need to refresh it.

>now run **npm run sample** and you can see the listing of all views n all in your channel (you can change request data in **sample.js** file). 

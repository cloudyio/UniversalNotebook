# Universal Notebook
Universal notebook is a basic project that allows many people to edit the same thing at one time using websockets

## Demo
- unfortunatley theres no demo website so nothing inaproprate will be displayed but you can view the video below showing how it works with 2 tabs (sorry for low quality):
https://www.youtube.com/watch?v=YGayQprkZBY
if you dont get whats happening the windows are 2 different website windows opened with the notepad which are automatically being updated, you can have as many clients connected to the server as you want.

## Features
- AutoSave and sync with all clients connected to server
- Good looking editor 
- Persistance - when server is turned off text is saved
- Helpful dynamic notifications

## How to use:
1. First configure your server.js file, can be put on any available port and chosen ip, if you want it to be public set host to 0.0.0.0
2. go to `src/routes/+page.svelte` and configure line 28 to the set server.js ip and port
3. Build and host sveltkit website, can be done with `npm run build`, i reccomend using a PaaS such as Vercel or self hosting one
4. Run your server with `node server.js`. For production you can use something like pm2 on your desired host
5. go to the website and enjoy
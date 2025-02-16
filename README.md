# GMLL
<a href="https://github.com/Hanro50/GMLL/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/msmc" alt="MIT license"/></a>
<a href="https://www.npmjs.com/package/gmll"><img src="https://img.shields.io/npm/v/gmll" alt="Version Number"/></a>
<a href="https://github.com/Hanro50/gmll/"><img src="https://img.shields.io/github/stars/hanro50/gmll" alt="Github Stars"/></a><br/>
A generic batteries included Minecraft Launcher Library.
Features include forge, fabric and quilt support. An instance manager, a metadata reader for mods, worlds, resource packs and texturepacks. Various fixes for legacy versions of the game. 

A simple modpack api capable of partial updates. The capability to easily create modPacks and wrap them in the required format the modpack API expects. An installer for 3rd party instances of forge and a robust version.json parser that should be able to handle anything the vanilla launcher can handle. The ability to change out some game sounds and assets easily is also provided. 

Limited support for unsupported windows and linux arm devices (1.19+). A built in runtime manager meaning you do not even need to have java installed to run GMLL. Limited support for M1 macs. Support for Windows (Vista and newer), MacOS and Linux.  

See [MSMC](https://github.com/Hanro50/MSMC) if you need an authentication library


# Support
No support will be given to launchers that seek to grant access to Minecraft to individuals whom do not posses a valid Minecraft License. In fact, doing this voids your licence to use this library and you will be asked to stop using this here library if you're found to be in violation of the licence. In other words, don't launch Minecraft if a user has not logged in with a valid account that owns the game at least once. I'm not in the mood to get sued by Mojang or Microsoft. -Hanro


Other then that. Join the mcjs café Discord for support (Link below)
<div>
   <a href="https://discord.gg/3hM8H7nQMA">
   <img src="https://img.shields.io/discord/861839919655944213?logo=discord"
      alt="chat on Discord"></a>
</div>
PS: If you find a bug, don't be afraid to report it on Github or Discord!  

# File systems
When running under Windows. GMLL only supports NTFS. GMLL will not work under FAT32, FAT16, exFAT or any other non NTFS based file system commonly used by Windows what so ever.

Linux and Mac users should not encounter this issue as on these systems, symlinks can be made by users whom are not system administrators. 

If your launcher is installed onto a drive which in of itself is not formatted as NTFS, but your launcher tells GMLL to generate its files on a partition that is formatted as NTFS. It _should_ work. A shortcut to the user's AppData folder is "%appdata%\\\<name of your launcher\>". Just incase...

The reason why GMLL only works on a drive formatted as NTFS on Windows is due to it making use of junctions, whereas on Linux and Mac GMLL will use symlinks instead. While they behave functionally the same for our purposes, junctions are a filesystem specific feature that only works on NTFS. While Windows also supports symlinks, you require administrator privileges to create them.   

# Multithreaded downloading
GMLL uses multiple threads by default to speed up downloads. This can be disabled however with the following bit of code
```js
//ES6 example
import { setMultiCoreMode } from "gmll/config";
setMultiCoreMode(false)
```
```js
//Common.JS example
const gmll = require("gmll");
gmll.config.setMultiCoreMode(false)
```

## a word on the docs
GMLL is to big to maintain an up to date dev doc with the current amount of resources awarded to the project. Instead, please see the included JSDocs in the comments in the type files. Since those will be exponentially easier to maintain and will likely provide the information specific to what you require a function to do. 

## Quick start 
This quick start will use MSMC for authentication. Full disclosure, GMLL endorses MSMC by virtue of the two projects sharing an author. 

ES6:
```js
//All modules can be accessed from the main GMLL index file
import { init, Instance } from "gmll";
//GMLL supports sub modules 
import { setRoot } from "gmll/config";
//Import the auth class from msmc
import { Auth } from "msmc";
//Changes where GMLL puts the ".minecraft" gmll creates (will default to a folder called .minecraft in the same folder in your root process directory)
setRoot(".MC");
//Gets GMLL to fetch some critical files it needs to function 
await init();
//Create a new auth manager
const authManager = new Auth("select_account");
//Launch using the 'raw' gui framework (can be 'electron' or 'nwjs')
const xboxManager = await authManager.launch("raw")
//Generate the minecraft login token
const token = await xboxManager.getMinecraft()
//GMLL uses the concept of instances. Essentially containerized minecraft installations 
var int = new Instance({ version: "1.19.3" })
//Launch with a token retrieved by msmc
int.launch(token.gmll());

```
CommonJS:
```js
//All modules can be accessed from the main GMLL index file
const gmll = require("gmll");
//GMLL supports sub modules 
const { setRoot }= require("gmll/config");
//Import the auth class
const { Auth } = require("msmc");
//Changes where GMLL puts the ".minecraft" gmll creates (will default to a folder called .minecraft in the same folder in your root process directory)
setRoot(".MC");
gmll.init().then(async () => {
  //Create a new auth manager
  const authManager = new Auth("select_account");
  //Launch using the 'raw' gui framework (can be 'electron' or 'nwjs')
  const xboxManager = await authManager.launch("raw")
  //Generate the minecraft login token
  const token = await xboxManager.getMinecraft()
  //GMLL uses the concept of instances. Essentially containerized minecraft installations 
  var int = new gmll.Instance()
  //Launch with a token retrieved by msmc
  int.launch(token.gmll());
})
```
# Initialization
The library relies on a collection core files that are dynamically downloaded from the internet to function. GMLL thus has two states it can be within. Initialized and uninitialized. GMLL will refuse to launch minecraft if it is not properly initialized. 

Before initialization. You'll likely want to load the config module and modify the paths GMLL uses. This is recommended as the initialization method will also create any folders required by GMLL to function. Essentially if you keep finding GMLL is generating random .minecraft folders, this is likely why. See the header "Config" under modules.

To initialize GMLL. You need to execute the init() function. 
```js
//CommonJS
const {init} = require("gmll");
init().then(...);
//ES6
import { init } from "gmll";
await init();
```
# Start here
## Import the module
GMLL contains a commonJS and a ES6 versions of every internal component
```js
//ES6 
import * as gmll from "gmll";
//commonJS
const gmll = require("gmll");
```
# Handling of instances 
An instance contains all the local files of a launcher profile. Your texture, resource, mod and data packs are all contained within a folder declared by an "instance". GMLL has an instance manager built into it and can easily keep track of multiple instances for you. 

## Instance constructor
GMLL's instance object accepts one parameter of type options. This is also the format GMLL will save instances in internally. 
```ts
export interface Options {
    /**The name of the instance */
    name?: string,
    /**The version of the game to load */
    version?: string,
    /**The installation path */
    path?: string,
    /**Ram in GB */
    ram?: Number,
    /**Custom data your launcher can use */
    meta?: any
    /**Asset index injection */
    assets?: assets
}
```
## loading and saving
```js
//CommonJS
const {Instance} = require("gmll/objects/instance");
//ES6
import {Instance} from "gmll/objects/instance";
...
const i = new Instance({ version: "1.18.1",name:"MY INSTANCE" });
//GMLL won't save instances automatically. Could hurt SSD users
i.save();
...
//some random code
...
//We have loaded the instance we created earlier back and can now launch it
const i777 = Instance.get("MY INSTANCE"); 
i777.launch(token);
```

## Custom icons and assets
Warning: borked in general on Mac and Linux for releases between 1.13 and 1.18.1 (<a href="https://bugs.mojang.com/browse/MCL-15163">MCL-15163?</a>). Also for some legacy releases it doesn't function 100% correctly either. Still looking into that.

Can be used to insert a matching launcher icon or replace a random song with Rick Astley's <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">Never going to give you up</a>. This will copy the files provided into Minecraft's asset index and create a custom asset index file matching the modifications. GMLL does take care to emulate vanilla here in how assets are added to the index to avoid collisions. 

Should be a predefined asset in Minecraft's asset index for the version the set instance launches. 
```js
//CommonJS
const {Instance} = require("gmll/objects/instance");
//ES6
import {Instance} from "gmll/objects/instance";
const i777 = instance.get("MY INSTANCE"); 
i777.injectAsset("minecraft/sounds/ambient/cave/cave1.ogg", "path/to/rick/roll.ogg");
i777.setIcon("path/to/32x32.png","path/to/16x16.png","path/to/mac.icns")
```

## Install \<Advanced!>
The install command on the instance does a range of preflight checks. From making sure the instance has the java version it currently needs already installed to downloading the version json, assets, libraries and what not the instance needs to launch. It does not compile the asset index for the index beforehand if there are custom assets. This function is called by the launch function as well. 
```js
//CommonJS
const {Instance} = require("gmll/objects/instance");
//ES6
import {Instance} from "gmll/objects/instance";
const i777 = Instance.get("MY INSTANCE"); 
i777.install();
```
# Warning!
From the point forward. It will be assumed that you have a basic understanding of how JavaScript works. Not every element will be showed like it was with the previous documentation!

# Basic file handling in GMLL
GMLL uses an object based system to handle files. This abstraction simplifies handling the small differences between Windows, Linux and MacOS in terms of how files, folders and directories are specified.

## Specifying a folder 
```js
const { dir } = require("gmll/objects/files");
const folder = new dir("path","to","folder");
```
Folders specify, while folders if you're on Windows and directories if you're on anything else. 

## Specifying a file 
```js
import { file } from "gmll/objects/files";
const file = new file("path/to/folder");
```
Specifies the path towards a file

# Configuration 
```js
//ES6 
import * as config from "gmll/config";
//commonJS
const config = require("gmll/config");
//fallback 
const config = gmll.config; 
```
The config class manages all the configuration data managed by the module. It should ideally be handled exclusively when the library has not been initialized yet as changing certain properties within the config module can cause GMLL to become uninitialized again. 

This is primarily due to this module controlling where GMLL will look and pull files from. <br><br>

## set and get functions
### Root
```ts
function setRoot(_root: dir | string): void;
```
<b style="color:red">Warning:</b> using "setRoot" will mark gmll as uninitialized. It will also reset all other filepaths to their default values based on the given root path. This call is used internally to set the initial filepaths. 

 This method can be used to easily redefine where GMLL stores Minecraft related data. Useful if the default location is not exactly optimal for one reason or another. 

### Assets
```ts
function setAssets(_assets: dir | string): void;
function getAssets(): string;
```
The location of the assets in GMLL. Internally it should look similar to the vanilla launcher's asset's folder. Apart from the fact that certain folders aren't deleted after GMLL shuts down. 
### Libraries
```ts
function setLibraries(_libraries: dir | string):void;
function getlibraries(): string;
```
The array of Java libraries Minecraft needs to function correctly. These two commands allow you to specify where GMLL will store them internally. 
### Instances
```ts
function setInstances(_instances: dir | string): void;
function getInstances(): string;
```
The default location where GMLL stores the game files used by various versions of minecraft. It will contain the name of the instance which will default to the version id if a set instance is not given a name. 
### Versions
```ts
function setVersions(_Versions: dir | string): void;
function getVersions(): string;
```
The location of the assets in GMLL. Internally it should look similar to the vanilla launcher's asset's folder. Apart from the fact that certain folders aren't deleted after GMLL shuts down. 
### Runtimes
```ts
function setRuntimes(_runtimes: dir | string): void;
function getRuntimes(): string;
```
The "runtimes" folder contains all the java runtimes GMLL knows about. Adding custom runtimes to this folder can technically be done, but isn't recommended. 
### Launcher/Meta
```ts
async function setLauncher(_launcher: dir | string): Promise<void>;
export declare function getMeta(): {
   manifests: dir;runtimes: dir;index: dir;profiles: dir;temp: dir;
};
```
The launcher folder contains all the core meta data and files GMLL uses. 
It is where it will save data related to instances, manifest and core index files.
The "getMeta" function wraps all of this into an easy to handle object that contains paths to 
every folder within the meta files. The files here are more here to instruct GMLL where to get certain files from and are checked when you run the "init" command. 

The "setLauncher" is asynchronous as it will reinitialize GMLL for you when it is used. 

#### Fields
<table>
<tr><th>name</th><th>description</th></tr>
<tr><td>manifests</td><td>This file contains files used to compile the version manifest file GMLL exposes to your Launcher. Want to add a custom version? Add a file in here. Forgiac actually drops in files here and every version should have exactly one file in this folder reference it. Since the manifests files also give GMLL some data points needed to sort a set custom version. </td></tr>
<tr><td>runtimes</td><td>Contains the index files GMLL uses to download a set runtime required by a set version. The vanilla provided indexes are checked against a sha hash. Although custom runtime indexes are left alone and will be ignored unless a set version of minecraft requests it.<br><br>  <b style="color:red">Warning:</b>Contents of these indexes are different per platform. Just take that into account as you need to insure the right index is placed here for the set platform your launcher is currently running on.</td></tr>
<tr><td>index</td><td>Contains miscellaneous index files used by GMLL to get other index files or to store internal data GMLL uses to function. Please ignore unless you're developing an addon for GMLL.</td></tr>
<tr><td>profiles</td><td>Where instance config data is saved when you run the "save()" function on the profile object. </td></tr>
</table>

### Natives
```ts
function setNatives(_natives: dir | string): void;
function getNatives(): string;
```
Where the natives a set version uses should be extracted to. 

### setLauncherVersion & setLauncherName
```ts
function setLauncherVersion(_version?: string): void;
function getLauncherVersion(): string;

function setLauncherName(_name: string = "GMLL"): void;
function setLauncherName(): string;
```
Declares the launcher version and name GMLL should report to Minecraft. Doesn't seem to do much of anything atm. 

### events 
```ts
function emit(tag: string, ...args: Array<Number | String>): void;
function setEventListener(events: Events): void;
function getEventListener(): Events;
```
This determines a few things in GMLL. Like console output and how data for a set event is processed.
If GMLL's console output is annoying then you can use the set method to feed in your own event listener. Check the JS docs for more information as the readme is likely to become outdated before long if I wrote information about it here. 

emit is an internal function and should not be used outside of GMLL. 

## Update config 
```ts
//Clears all settings
function clrUpdateConfig(): void;
//Adds a setting to the list of things GMLL should update
function addUpdateConfig(item: update): void;
//Gets the current list of things GMLL will update upon initialization
function getUpdateConfig(): update[];
```
Can be used to fine tune GMLL if your launcher isn't using all of GMLL's functions. 
For instance you can set it to only update the vanilla version manifest if you're not planning on using fabric or you can ask it to not download/update forgiac. 

## misc
```ts
//Used to resolve paths within the context of GMLL. Useful for plugin developers
function resolvePath(file: string): string;

//Used for GMLL plugins. Any function passed to this function will be called every time GMLL is initialized. 
export function initializationListener(func: () => void | Promise<void>):void;
//Does some preflight checks and is actually called by the "init" function in the index file. This can be called directly and will be no different then calling "init" in the index file.
export async function initialize();
```
# Legacy version fixes
By default GMLL (versions 1.6.0 and newer) will download [Agenta](https://www.curseforge.com/minecraft/mc-mods/agenta) to fix issues with legacy versions (pre release 1.7.10). 

## Fixes include:
Further sound fixes (Really early Alpha builds)
> They want a certain resource file that no longer exists. 

Minecraft skin fixes (From Minecraft Alpha)
> All alpha builds that pinged the skin servers worked! ...or appeared to work. Need more testing.

Minecraft cape fixes (From Minecraft Beta)
> Results on beta 1.0 and 1.2 may very 

Minecraft Authentication server fixes
> Please note this only fixes the client side checks. Please install Agenta as a bukkit plugin or use it a as a java agent to fix the server side checks!

Minecraft forge for 1.3.2 to 1.5.2 fixes
> I redirected the download requests from these older versions of forge to an archive. This allows these versions to get the files they require to function. 

# NBT Shenanigans
GMLL has a sub module capable of reading NBT Data. 
GMLL does provide two translations for NBT data out of the box, one that discards type information and one that preserves it.
If the demand arises then we could in the future add the ability to save NBT data back into a format Minecraft can comprehend. 

# modpacks 
```ts
//part of gmll/objects/instance
async function wrap(baseUrl: string, save: dir | string, name?: string , forge?: { jar: file });
...
//part of gmll/handler
async function importLink(url: string): Promise<manifest>;
async function importLink(url: string, name: string): Promise<Instance>;
async function importLink(url: string, name?: string): Promise<Instance | manifest> 
```
GMLL has a built in modpack API it can use to obtain and install modpacks. It also has a function to manually wrap up instances into the required format you need to upload said modpack to a webserver somewhere. Modpacks can still be manually built by hand since the installer can do more then the wrapper will give you access to. 

## Basic setup
### Creation:
```js
//Create an instance with the settings you want
var int = new gmll.Instance({ version: "1.19" })
//Customise the asset index for that version like so
int.setIcon("icon_32x32.png", "icon_16x16.png");
//Finally create your modpack - this example is what to do for fabric and vanilla packs
await int.wrap(
    /**The URL link to the base folder of this modpacks final resting spot*/
    "https://www.hanro50.net.za/test", 
    /**The output directory where you want GMLL to compile the files to.*/ 
    new dir(".wrap"),
    /**The name of your pack.*/ 
    "MyAmazingPack"
    )
...
//Alternatively. Here's what to do for Forge based packs
await int.wrap(
    /**The URL link to the base folder of this modPacks final resting spot*/
    "https://www.hanro50.net.za/test", 
    /**The output directory where you want GMLL to compile the files to.*/ 
    new dir(".wrap"),
    /**The name of your pack.*/ 
    "MyAmazingPack",
    /**This is a bit more complex here for future proofing. This is just a path to your forge jar*/
    new file("path/to/installer/jar"));
```
### Importing:
```js
const e = await fastLaunch("raw", console.log);
const token = gmll.wrapper.msmc2token(e);

/**This will only install the manifest files for a custom modpack. Making the created version selectable as the base of a new instance.*/
(await gmll.handler.importLink(
    /**The link leading to a modpack. Fun fact, this link actually leads to a demo of this whole system*/
    "https://www.hanro50.net.za/test")).launch(token);
...
/**This version of the function will go ahead and create an instance with the name provided.*/
(await gmll.handler.importLink(
    /**The link leading to a modpack. Fun fact, this link actually leads to a demo of this whole system*/
    "https://www.hanro50.net.za/test",
    /**A custom name for the new instance*/
    "launcherTest")).launch(token);
```

## A tale of two mod loaders...

While GMLL's modpack api supports both forge (via <a href="https://github.com/Hanro50/Forgiac/">forgiac</a>) and fabric. Fabric is recommended over forge due to a lesser chance of breaking due to changes made to forge by the forge developers. 

It should be mentioned that for GMLL to wrap a forge based modpack. The forge installer will need to be provided as an input. Ignoring this field will treat the modpack as a fabric modpack. While this can still work, you'll need to instruct your user to manually install forge. The reason why you do not need to manually install fabric versions is because GMLL will automatically generate the manifest files needed to install nearly any version of fabric.   


## A note on jarmods
atm GMLL handles jar mods by extracting the vanilla jar of a set version, it will then take all jars and zips located in the ./jarmods folder within a set instance's folder, extract them over the already extracted internals of a set version and will then compress it all back into a jar. 

Bar you take the necessary precautions to ensure your old mods are formatted correctly or abide by Mojang's EULA before inserting your mcp client jar, this system will create a custom jar with the required files overwritten for those mods to work. Atm it will use a json (priority.json) file to modify the order in which it loads mods. Failing that it will go off alphabetical order. 


import { resolvePath, getMeta, getAssets } from "../config.js";
import { getLatest } from "../handler.js";
import { fsSanitizer, getCpuArch, throwErr, assetTag } from "../internal/util.js";
import { join } from "path";
import { assetIndex, launchArguments, launchOptions } from "types";
import { dir, file } from "./files.js";
import version from "./version.js";
import * as metaHandler from "../internal/handlers/meta.js";
import * as modsHandler from "../internal/handlers/mods.js";
import * as launchHandler from "../internal/handlers/launch.js";
/**
 * An instance is what the name intails. An instance of the game Minecraft containing Minecraft specific data.
 * This information on where the game is stored and the like. The mods installed and what not. 
 */
export default class instance {
    [x: string]: any;

    /**@param opt This parameter contains information vital to constructing the instance. That being said, GMLL will never the less pull in default values if it is emited*/
    protected path: string;
    protected version: string;
    protected name: string;
    protected env: any;

    protected ram: number;
    protected meta: any;
    protected assets: Partial<assetIndex>;
    protected javaPath: "default" | string;
    protected noLegacyFix: boolean;

    /**Additional arguments added for legacy versions */
    public static oldJVM = [
        "-Djava.util.Arrays.useLegacyMergeSort=true",
        "-Dminecraft.applet.TargetDirectory=\"${game_directory}\"",
    ]

    /**The default game arguments, don't mess with these unless you know what you are doing */
    public static defaultGameArguments = [
        "-Xms${ram}M",
        "-Xmx${ram}M",
        "-XX:+UnlockExperimentalVMOptions",
        "-XX:+UseG1GC",
        "-XX:G1NewSizePercent=20",
        "-XX:G1ReservePercent=20",
        "-XX:MaxGCPauseMillis=50",
        "-XX:G1HeapRegionSize=32M",
        "-Dlog4j2.formatMsgNoLookups=true",
    ]
    /**Do not mess with unless you know what you're doing. Some older versions may not launch if information from this file is missing. */
    public static defJVM: launchArguments = [
        { "rules": [{ "action": "allow", "os": { "name": "osx" } }], "value": ["-XstartOnFirstThread"] },
        { "rules": [{ "action": "allow", "os": { "name": "windows" } }], "value": "-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump" },
        { "rules": [{ "action": "allow", "os": { "name": "windows", "version": "^10\\." } }], "value": ["-Dos.name=Windows 10", "-Dos.version=10.0"] },
        { "rules": [{ "action": "allow", "os": { "arch": "x86" } }], "value": "-Xss1M" },
        "-Djava.library.path=${natives_directory}",
        "-Dminecraft.launcher.brand=${launcher_name}",
        "-Dminecraft.launcher.version=${launcher_version}",
        "-cp",
        "${classpath}"
    ]
    constructor(opt: launchOptions = {}) {
        this.version = opt.version || getLatest().release;
        this.name = opt.name || this.version;
        this.path = opt.path || join("<instance>", fsSanitizer(this.name));
        this.ram = opt.ram || 2;
        this.meta = opt.meta || undefined;
        this.assets = opt.assets || {};
        this.javaPath = opt.javaPath || "default";
        this.env = opt.env || {};
        this.noLegacyFix = opt.noLegacyFix || false;
        this.getDir().mkdir();
        const MESA = "MESA_GL_VERSION_OVERRIDE"
        if (!["x64", "arm64", "ppc64"].includes(getCpuArch()) && this.ram > 1.4) {
            console.warn("[GMLL]: Setting ram limit to 1.4GB due to running on a 32-bit version of java!")
            this.ram = 1.4;
        }
        if (!(MESA in this.env) && process.platform == "linux") {
            this.env[MESA] = "4.6"
        }
    }
    /**Gets the load order of minecraft jars in jar mod loader. */
    public getJarModPriority = modsHandler.getJarModPriority;
    /**Install forge in this instance. */
    public installForge = modsHandler.installForge;
    /**
     * Used to modify minecraft's jar file (Low level)
     * @param metapaths 
     * @param version 
     * @returns 
     */
    public static jarmod = modsHandler.jarmod;
    /**An version of the wrap function that takes an object as a variable instead of the mess the base function takes. */
    public pack = modsHandler.pack;
    /**Wraps up an instance in a prepackaged format that can be easily uploaded to a server for distribution 
     * @param baseUrl The base URL the generated files will be stored within on your server. For example http\:\/\/yourawesomdomain.net\/path\/to\/files\/
     * @param save The file GMLL will generate the final files on. 
     * @param name The name that should be used to identify the generated version files
     * @param forge The path to a forge installation jar
     * @param trimMisc Gets rid of any unnecessary miscellaneous files
     */
    public wrap = modsHandler.wrap;
    /**
     * @returns Some low level meta paths used to obtain some key files of this instance. 
     */
    public getMetaPaths = metaHandler.getMetaPaths;
    /**
     * Gets information about mods in this instance. This includes the loader version plus some general 
     * information about the mod author and mod itself. This will also provide you the icon for a set mod if it can be obtained.\
     * 
     * Works with Legacy forge, forge, fabric, riftloader and liteloader
     */
    public getMods = metaHandler.getMods;
    /**
     * Gets information about the installed resource and texture packs of this instance. 
     * This includes information like the pack icon, name, description, legal documents and credits. 
     */
    public getResourcePacks = metaHandler.getResourcePacks;
    /**
     * Gets some general information about all the world files in this instance.
     * It also decodes the level.DAT file for you and returns the decoded file as a JSON file. 
     * 
     * It also decodes the player data stored in the "playerdata" and "stats" subfolder in newer versions of the game. 
     */
    public getWorlds = metaHandler.getWorlds;
    /**
     * This function is used to launch the game. It also runs the install script for you. 
     * This essentially does an integrity check. 
     * @param token The player login token
     * @param resolution Optional information defining the game's resolution
     */
    public launch = launchHandler.launch;
    /**
     * Runs the installer script without launching MC
     * @returns The instance's version object. 
     * @see {@link getVersion} if you just want the instance's version
     */
    public install = launchHandler.install;
    /**
     * 
     * @returns An object containing the version data this instance is based on
     * @see {@link install} if you want to initiate that version object first!
     */
    async getVersion() {
        return await version.get(this.version)
    }

    getDir() {
        return new dir(resolvePath(this.path));
    }

    /**Gets a list of profiles that where saved previously */
    static getProfiles() {
        const profiles: Map<string, (launchOptions & { get: () => instance })> = new Map();
        getMeta().profiles.ls().forEach(e => {
            if (e instanceof file && e.getName().endsWith(".json")) {
                const profile = e.toJSON<launchOptions>()
                profiles.set(profile.name, { ...profile, get: () => this.get(e.getName()) })
            }
        })
        return profiles;
    }

    /**Gets a set profile based on the name of that profile */
    static get(profile: string) {
        if (!profile.endsWith(".json")) profile += ".json"
        const _file = getMeta().profiles.getFile(fsSanitizer(profile));
        const json = _file.exists() ? _file.toJSON<launchOptions>() : {};
        return new instance(json);
    }


    /**
 * Saves the instance data. Can be used to automatically get the instance again by using it's name
 * @see {@link get} for more info
 */
    save() {
        getMeta().profiles.getFile(fsSanitizer(this.name + ".json")).write(this);
        return this;
    }
    /**
     * This will tell GMLL to rerun some of the install scripts it normally skips upon a second "install" call.
     * This won't reset worlds or rewrite dynamic files. Use this if, for instance, forge failed to install. 
     */
    reinstall() {
        this.getDir().getFile(".installed.txt").rm();
    }
    /**Injects a set selection of images into the asset files and sets them as the icon for this instance */
    setIcon(x32?: string | file, x16?: string | file, mac?: string | file) {
        if (x32) {
            const x32Icon = this.injectAsset("icons/icon_32x32.png", x32);
            this.assets.objects["minecraft/icons/icon_32x32.png"] = x32Icon;
        }
        if (x16) {
            const x16Icon = this.injectAsset("icons/icon_16x16.png", x16);
            this.assets.objects["minecraft/icons/icon_16x16.png"] = x16Icon;
        }
        if (mac) {
            const macIcon = this.injectAsset("icons/minecraft.icns", mac);
            this.assets.objects["minecraft/icons/minecraft.icns"] = macIcon;
        }
    }
    /**
     * Inject custom assets into the game.
     * @param key The asset key
     * @param path The path to the asset file in questions...it must exist!
     */
    injectAsset(key: string, path: string | file) {
        if (typeof path == "string") path = new file(path);
        if (!path.exists()) throwErr("Cannot find file");
        const hash = path.getHash();
        path.copyTo(assetTag(getAssets().getDir("objects"), hash).getFile(hash));
        if (!this.assets.objects) this.assets.objects = {};
        const asset = { hash: hash, size: path.getSize(), ignore: true };
        this.assets.objects[key] = asset;
        return asset
    }

    getName() {
        return this.name;
    }
}

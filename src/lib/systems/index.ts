import type { FullThrustShip } from "../../schemas/ship.js";
import type { Arc, SpecialSystem, System, ISystem } from "./_base.js";
export type { Arc, SpecialSystem, System, ISystem };

import { Hull } from "./specials/hull.js";
import { Stealth } from "./specials/stealth.js";
import { Streamlining } from "./specials/streamlining.js";
import { Armour } from "./specials/armour.js";
export { Hull, Stealth, Streamlining, Armour };

// Import newly added systems here
import { Drive } from "./drive.js";
import { Ftl } from "./ftl.js";
import { Suicide } from "./suicide.js";
import { FireControl } from "./fireControl.js";
import { Adfc } from "./adfc.js";
export { Drive, Ftl, Suicide, FireControl, Adfc };
import { Screen } from "./screen.js";
import { MineSweeper } from "./mineSweeper.js";
import { MineLayer } from "./mineLayer.js";
import { Bay } from "./bay.js";
import { Magazine } from "./magazine.js";
export { Screen, MineSweeper, MineLayer, Bay, Magazine };
import { DamageControl } from "./damageControl.js";
import { Marines } from "./marines.js";
import { Ecm } from "./ecm.js";
import { StealthField } from "./stealthField.js";
import { Holofield } from "./holofield.js";
export { DamageControl, Marines, Ecm, StealthField, Holofield };
import { Amt } from "./amt.js";
import { Missile } from "./missile.js";
import { Salvo } from "./salvo.js";
import { SalvoLauncher } from "./salvoLauncher.js";
import { Mkp } from "./mkp.js";
export { Amt, Missile, Salvo, SalvoLauncher, Mkp };
import { RocketPod } from "./rocketPod.js";
import { Ads } from "./ads.js";
import { Pds } from "./pds.js";
import { ScatterGun } from "./scatterGun.js";
import { Grapeshot } from "./grapeshot.js";
export { RocketPod, Ads, Pds, ScatterGun, Grapeshot };
import { SpinalBeam } from "./spinalBeam.js";
import { SpinalPlasma } from "./spinalPlasma.js";
import { SpinalSingularity } from "./spinalSingularity.js";
import { Beam } from "./beam.js";
import { Emp } from "./emp.js";
export { SpinalBeam, SpinalPlasma, SpinalSingularity, Beam, Emp };
import { PlasmaCannon } from "./plasmaCannon.js";
import { Phaser } from "./phaser.js";
import { Transporter } from "./transporter.js";
import { Needle } from "./needle.js";
import { Graser } from "./graser.js";
export { PlasmaCannon, Phaser, Transporter, Needle, Graser };
import { Gatling } from "./gatling.js";
import { Particle } from "./particle.js";
import { Meson } from "./meson.js";
import { Submunition } from "./submunition.js";
import { Fusion } from "./fusion.js";
export { Gatling, Particle, Meson, Submunition, Fusion };
import { TorpedoPulse } from "./torpedoPulse.js";
import { Kgun } from "./kgun.js";
import { Gravitic } from "./gravitic.js";
import { Pbl } from "./pbl.js";
import { Hangar } from "./hangar.js";
export { TorpedoPulse, Kgun, Gravitic, Pbl, Hangar };
import { LaunchTube } from "./launchTube.js";
import { Fighters } from "./fighters.js";
import { Pulser } from "./pulser.js";
import { Turret } from "./turret.js";
import { CloakDevice } from "./cloakDevice.js";
export { LaunchTube, Fighters, Pulser, Turret, CloakDevice };
import { CloakField } from "./cloakField.js";
import { Sensors } from "./sensors.js";
import { Decoy } from "./decoy.js";
import { Ortillery } from "./ortillery.js";
export { CloakField, Sensors, Decoy, Ortillery };
import { SpinalNova } from "./spinalNova.js";
import { SpinalWave } from "./spinalWave.js";
import { Reflex } from "./reflex.js";
export { SpinalNova, SpinalWave, Reflex };
import { Shroud } from "./shroud.js";
export { Shroud };
import { Flawed } from "./flawed.js";
export { Flawed };

import { type2name, mod2name } from "./fighters.js";
export { type2name as fighterType2Name, mod2name as fighterMod2Name };

export const specialsList: string[] = [
    "hull",
    "stealth",
    "streamlining",
    "armour",
];

// Give each system a basic name for sorting and selection
export const sortNames = new Map<string, string>([
    ["suicide", "Antimatter Suicide Charge"],
    ["fireControl", "Fire Control"],
    ["adfc", "Area Defense Fire Control"],
    ["screen", "Defensive Screen"],
    ["mineSweeper", "Mine Sweeper"],
    ["mineLayer", "Mine Layer"],
    ["bay", "Hold or Berth"],
    ["magazine", "Salvo Missile Magazine"],
    ["damageControl", "Extra Damage Control"],
    ["marines", "Extra Marines"],
    ["ecm", "ECM Device"],
    ["stealthField", "Stealth Field Generator"],
    ["holofield", "Holofield Generator"],
    ["amt", "Antimatter Missile"],
    ["missile", "Heavy Missile"],
    ["salvo", "Salvo Missile Rack (single-use)"],
    ["salvoLauncher", "Salvo Missile Launcher"],
    ["mkp", "Multiple Kinetic Penetrator"],
    ["rocketPod", "Rocket Pod"],
    ["ads", "Area Defense System"],
    ["pds", "Point Defense System"],
    ["scatterGun", "Scatter Gun"],
    ["grapeshot", "Grapeshot Launcher"],
    ["spinalBeam", "Spinal Mount - Beam"],
    ["spinalPlasma", "Spinal Mount - Plasma"],
    ["spinalSingularity", "Spinal Mount - Point Singularity Projector"],
    ["beam", "Beam"],
    ["emp", "EMP Projector"],
    ["plasmaCannon", "Plasma Cannon"],
    ["phaser", "Phaser"],
    ["transporter", "Transporter Beam"],
    ["needle", "Needle Beam"],
    ["graser", "Graser"],
    ["gatling", "Gatling Battery"],
    ["particle", "Twin Particle Array"],
    ["meson", "Meson Projector"],
    ["submunition", "Turreted Submunition Pack"],
    ["fusion", "Fusion Array"],
    ["torpedoPulse", "Pulse Torpedos"],
    ["kgun", "K-Gun"],
    ["gravitic", "Gravitic Gun"],
    ["pbl", "Plasma Bolt Launcher"],
    ["hangar", "Fighter Bay/Rack"],
    ["launchTube", "Launch Tube"],
    ["fighters", "Fighters"],
    ["pulser", "Pulser"],
    ["turret", "Turret"],
    ["cloakDevice", "Cloaking Device"],
    ["cloakField", "Cloaking Field"],
    ["sensors", "Advanced Sensors"],
    ["decoy", "Weasel Decoy"],
    ["ortillery", "Ortillery System"],
    ["spinalNova", "Spinal Mount - Nova Cannon (deprecated)"],
    ["spinalWave", "Spinal Mount - Wave Gun (deprecated)"],
    ["reflex", "Reflex Field (deprecated)"],
    ["shroud", "Vapour Shroud"],
]);

// Put the short code in the appropriate list in whatever order. They get sorted for display.
export const systemList: string[] = [
    "shroud",
    "reflex",
    "ortillery",
    "decoy",
    "sensors",
    "cloakDevice",
    "cloakField",
    "turret",
    "launchTube",
    "hangar",
    "holofield",
    "stealthField",
    "ecm",
    "damageControl",
    "marines",
    "magazine",
    "bay",
    "mineLayer",
    "mineSweeper",
    "screen",
    "suicide",
    "fireControl",
    "adfc",
].sort((a, b) => {
    if (sortNames.get(a)! > sortNames.get(b)!) {
        return 1;
    } else if (sortNames.get(a)! < sortNames.get(b)!) {
        return -1;
    } else {
        return 0;
    }
});
export const ordnanceList: string[] = [
    "rocketPod",
    "salvoLauncher",
    "missile",
    "salvo",
    "amt",
].sort((a, b) => {
    if (sortNames.get(a)! > sortNames.get(b)!) {
        return 1;
    } else if (sortNames.get(a)! < sortNames.get(b)!) {
        return -1;
    } else {
        return 0;
    }
});
export const weaponList: string[] = [
    "spinalWave",
    "spinalNova",
    "pulser",
    "pbl",
    "gravitic",
    "kgun",
    "torpedoPulse",
    "fusion",
    "submunition",
    "meson",
    "particle",
    "gatling",
    "graser",
    "needle",
    "transporter",
    "phaser",
    "plasmaCannon",
    "emp",
    "beam",
    "spinalSingularity",
    "spinalPlasma",
    "spinalBeam",
    "grapeshot",
    "scatterGun",
    "pds",
    "mkp",
    "ads",
].sort((a, b) => {
    if (sortNames.get(a)! > sortNames.get(b)!) {
        return 1;
    } else if (sortNames.get(a)! < sortNames.get(b)!) {
        return -1;
    } else {
        return 0;
    }
});
export const allRegSystems: string[] = [
    ...systemList,
    ...ordnanceList,
    ...weaponList,
];

export const getSpecial = (
    id: string,
    ship: FullThrustShip
): SpecialSystem | undefined => {
    switch (id) {
        case "hull":
            return new Hull(ship);
        case "stealth":
            return new Stealth(ship);
        case "streamlining":
            return new Streamlining(ship);
        case "armour":
            return new Armour(ship);
        default:
            console.error(
                `Could not find a special system with the name ${id}`
            );
            break;
    }
};

// Finally, return the appropriate object when requested with the short code.
export const getSystem = (
    data: ISystem,
    ship: FullThrustShip
): System | undefined => {
    switch (data.name) {
        case "drive":
            return new Drive(data, ship);
        case "ftl":
            return new Ftl(data, ship);
        case "suicide":
            return new Suicide(data, ship);
        case "fireControl":
            return new FireControl(data, ship);
        case "adfc":
            return new Adfc(data, ship);
        case "screen":
            return new Screen(data, ship);
        case "mineSweeper":
            return new MineSweeper(data, ship);
        case "mineLayer":
            return new MineLayer(data, ship);
        case "bay":
            return new Bay(data, ship);
        case "magazine":
            return new Magazine(data, ship);
        case "damageControl":
            return new DamageControl(data, ship);
        case "marines":
            return new Marines(data, ship);
        case "ecm":
            return new Ecm(data, ship);
        case "stealthField":
            return new StealthField(data, ship);
        case "holofield":
            return new Holofield(data, ship);
        case "amt":
            return new Amt(data, ship);
        case "missile":
            return new Missile(data, ship);
        case "salvo":
            return new Salvo(data, ship);
        case "salvoLauncher":
            return new SalvoLauncher(data, ship);
        case "mkp":
            return new Mkp(data, ship);
        case "rocketPod":
            return new RocketPod(data, ship);
        case "ads":
            return new Ads(data, ship);
        case "pds":
            return new Pds(data, ship);
        case "scatterGun":
            return new ScatterGun(data, ship);
        case "grapeshot":
            return new Grapeshot(data, ship);
        case "spinalBeam":
            return new SpinalBeam(data, ship);
        case "spinalPlasma":
            return new SpinalPlasma(data, ship);
        case "spinalSingularity":
            return new SpinalSingularity(data, ship);
        case "beam":
            return new Beam(data, ship);
        case "emp":
            return new Emp(data, ship);
        case "plasmaCannon":
            return new PlasmaCannon(data, ship);
        case "phaser":
            return new Phaser(data, ship);
        case "transporter":
            return new Transporter(data, ship);
        case "needle":
            return new Needle(data, ship);
        case "graser":
            return new Graser(data, ship);
        case "gatling":
            return new Gatling(data, ship);
        case "particle":
            return new Particle(data, ship);
        case "meson":
            return new Meson(data, ship);
        case "submunition":
            return new Submunition(data, ship);
        case "fusion":
            return new Fusion(data, ship);
        case "torpedoPulse":
            return new TorpedoPulse(data, ship);
        case "kgun":
            return new Kgun(data, ship);
        case "gravitic":
            return new Gravitic(data, ship);
        case "pbl":
            return new Pbl(data, ship);
        case "hangar":
            return new Hangar(data, ship);
        case "launchTube":
            return new LaunchTube(data, ship);
        case "fighters":
            return new Fighters(data, ship);
        case "pulser":
            return new Pulser(data, ship);
        case "turret":
            return new Turret(data, ship);
        case "cloakDevice":
            return new CloakDevice(data, ship);
        case "cloakField":
            return new CloakField(data, ship);
        case "sensors":
            return new Sensors(data, ship);
        case "decoy":
            return new Decoy(data, ship);
        case "ortillery":
            return new Ortillery(data, ship);
        case "spinalNova":
            return new SpinalNova(data, ship);
        case "spinalWave":
            return new SpinalWave(data, ship);
        case "reflex":
            return new Reflex(data, ship);
        case "shroud":
            return new Shroud(data, ship);
        case "flawed":
            return new Flawed(data, ship);
        default:
            console.error(`Could not find a system with the name ${data.name}`);
            break;
    }
};

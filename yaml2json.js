
import * as fs from 'fs'
import * as yaml from './js-yaml.mjs'

const features = yaml.load(fs.readFileSync("btbs.yaml", "utf8"))

const objs = {
    drawData: {
        type: "FeatureCollection",
        features
    },
    searchGroups:[],
    searchExcludeSets: [],
    OBJMAP_SV_VERSION: 3
}

fs.writeFileSync("btbs.json", JSON.stringify(objs, null, 2))

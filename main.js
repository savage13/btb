
function to_objmap( btb ) {
    return {
        searchGroups : [],
        OBJMAP_SV_VERSION : 3,
        searchExcludeSets : [],
        drawData: {
            features: [ btb ]
        }
    }
}

function doit( file ) {
    var x = btbs.find(b => b.properties.file == file);
    x = to_objmap( x );
    downloadObjectAsJson(x, file);
    return false;
}

function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    if(!(exportName.endsWith(".json"))) {
        exportName = exportName + ".json";
    }
    downloadAnchorNode.setAttribute("download", exportName);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function $(x) {
    return document.querySelector(x);
}


async function get_file( name ) {
    return fetch(name)
        .then(res  => res.json())
        .then(data => data);
}

function table() {
    let t = document.createElement('div');
    t.classList.add('table');
    return t;
}

function col( html ) {
    var col = document.createElement('div');
    col.classList.add('col');
    col.innerHTML = html;
    return col;
}

function rowc(data, col_class) {
    let r = document.createElement('div');
    r.classList.add('row');
    data.forEach(c => {
        if(typeof c === "object") {
            let x = col(c.text);
            if(col_class !== "") {
                x.classList.add(col_class);
            }
            x.setAttribute('title', c.title);
            r.appendChild( x );
        } else {
            let x2 = col(c);
            if(col_class !== "") {
                x2.classList.add(col_class);
            }
            r.appendChild( x2 );
        }
    });
    return r;
}
function row( data ) {
    return rowc(data, "");
}

function mps_to_kmph(x) {
    return x * (1/1000) * (60*60);
}
function mps_to_mph(x) {
    let ft_per_meter = 3.28084;
    let ft_per_mile = 5280;
    return x * ft_per_meter * 1/ft_per_mile * (60*60);
}
function property(b, prop) {
    return props(b)[prop];
}
function feature(b) {
    return b;//.data.drawData.features[0];
}
function props(b) {
    //return b.data.drawData.features[0].properties;
    return b.properties;
}
let sx = 600 / (6000*2);
let sy = 500 / (5000*2);

let paths = [];
let btbs = [];

function matches_search( b ) {
    let prop = props(b)
    if(search.length == 0) {
        return true;
    }
    if(prop.name.toLowerCase().includes(search)) {
        return true;
    }
    if(prop.to.toLowerCase().includes(search)) {
        return true;
    }
    if(prop.from.toLowerCase().includes(search)) {
        return true;
    }
    if(prop.enemy.toLowerCase().includes(search)) {
        return true;
    }
    if(prop.enemy_id.toLowerCase().includes(search)) {
        return true;
    }
    if(prop.urls.some(url => url.user.toLowerCase().includes(search) || url.category.toLowerCase().includes(search))) {
        return true;
    }
    return false;
}

function btb_dist(btb) {
    let feat = feature(btb);
    let prop = props(btb);
    let p = feat.geometry.coordinates[0];
    let q = feat.geometry.coordinates[1];
    let dx = p[0]-q[0];
    let dy = p[1]-q[1];
    let dist = Math.sqrt(dx*dx + dy*dy);
    return dist;
}

function populate_table() {
    let v = $("#app");
    v.innerHTML = "";
    let t = table();
    for(var i = 0; i < btbs.length; i++) {
        let b = btbs[i];
        if(! matches_search(b)) {
            continue;
        }
        var d = btb_popup(b, false);
        d.classList.add("topborder");
        d.classList.add("mb10");
        t.appendChild(d);
    }
    v.appendChild(t);
}

async function init() {
    let file = await get_file("btbs0.json")
    btbs = file.drawData.features;
    for(var i = 0; i < btbs.length; i++) {
        let feat = btbs[i];
        //let b = btb.data;
        //let feat = b.drawData.features[0];
        let prop = feat.properties;
        let p = feat.geometry.coordinates[0];
        let q = feat.geometry.coordinates[1];
        paths.push( [{x: p[0], y: p[1]},
                     {x: q[0], y: q[1]}]);
    }
    populate_table();
    draw_btbs();
}
function draw_btbs() {
    paths.forEach((p,i) => draw_btb(p[0], p[1], "red", btbs[i]));
}

function div() {
    return document.createElement('div');
}

function $b(txt) {
    const b = document.createElement('b')
    b.textContent = txt
    return b
}
function $div(...kids) {
    let el = div()
    el.append(...kids)
    return el
}
function $span(...kids) {
    let el = document.createElement('span')
    el.append(...kids)
    return el
}
function $a(url, text) {
    const a = document.createElement('a')
    a.href = url
    a.target = "_blank"
    a.textContent = text
    return a
}
function popup(key, text) {
    const a = document.createElement('a')
    a.href = "#"
    a.textContent = text
    a.addEventListener('click', (ev) => { open_popup(key) })
    return a
}
function click_doit(key, text) {
    const a = document.createElement('a')
    a.href = "#"
    a.textContent = text
    a.addEventListener('click', (ev) => { doit(key) })
    return a
}

function btb_popup( btb, long) {
    let prop = props( btb )
    let up = div();
    let dist = btb_dist(btb);
    let speed_ms = dist / prop.time;
    let speed_kmh = mps_to_kmph(speed_ms);
    let speed_mph = mps_to_mph(speed_ms);
    let d = div();
    d.innerHTML = `<b>${prop.name}</b>`;
    up.appendChild(d);
    let rows = [
        $div($b("From"), prop.from),
        $div($b("To:"), prop.to),
        $div($b("Enemy:"), ` ${prop.enemy} (${prop.enemy_id})`),
    ];
    rows.push( ... prop.urls.map(url =>
        [$div( $a(url.url, "video"),  ` (${url.user} - ${url.category})`)]
    ).flat() );
    if(long) {
        rows.push( ... [
                   $div(`- ${dist.toFixed(2)} m`),
                   $div(`- ${prop.time.toFixed(2)} s`),
                   $div(`- ${speed_ms.toFixed(2)} m/s`),
            $div(`- ${speed_kmh.toFixed(2)} km/h (${speed_mph.toFixed(2)} mph)`)
        ]);
    } else {
        rows.push(popup(prop.name, "Open Popup"))
    }
    rows.push(click_doit(prop.file, "json"))
    rows.forEach(row => {
        //let d = div();
        //d.innerHTML = row;
        row.classList.add("pl10");
        up.append(row);
    })

    return up;
}

function open_popup( name ) {
    let marker = markers[name];
    if(marker !== undefined) {
        marker.fire('click');
        return true;
    }
    return false;
}

function isTouchDevice() {
    return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
}
let xcolor = 'black';
xcolor = 'rgba(237,174,192,1)'; // Rosewater
xcolor = 'rgba(6,204,255,1)'; // Silent Princess Blue

var markers = {};

function draw_btb(p1, p2, color, btb) {
    var prop = props(btb);
    var q1 = tr.transform(L.point(p1.x,p1.y)); // From
    var q2 = tr.transform(L.point(p2.x,p2.y)); // To
    var q3 = q1.add(q2).divideBy(2);           // Midpoint
    var line = [[q1.y, q1.x],[q2.y, q2.x]];    // Line
    var marker = L.polyline(line, {weight: 2, color: xcolor }).addTo(map);
    arrow_head(marker).addTo(map);
    marker.bindTooltip( prop.name );
    // Do not open tooltip on click, grumble
    marker._events.click.pop();
    marker.bindPopup( btb_popup( btb, true) );
    map.almostOver.addLayer( marker );
    markers[prop.name] = marker;
}
function arrow_head( line ) {
    return L.polylineDecorator(line, {
        patterns: [
            {
                offset: '100%', repeat: 0, symbol:
                L.Symbol.arrowHead({pixelSize: 7.5, polygon: false,
                                    pathOptions: {weight: 2, stroke: true, color: xcolor}})}
        ]
    });
}


function handleSearch(ev) {
    search = event.target.value.toLowerCase().trim();
    populate_table();
}

let search = "";
$("#search").addEventListener('input', handleSearch);

init();

var TILE_SIZE = 256;
var MAP_SIZE = [24000, 20000];
const crs = L.Util.extend({}, L.CRS.Simple);
crs.transformation = new L.Transformation(
    4 / TILE_SIZE,
    MAP_SIZE[0] / TILE_SIZE,
    4 / TILE_SIZE,
    MAP_SIZE[1] / TILE_SIZE
);
let MIN_ZOOM = 2;
let MAX_ZOOM = 7;

var map = L.map('map', {
    minZoom: MIN_ZOOM,
		maxZoom: MAX_ZOOM,
		center: [1000, 0],
    zoom: 3,
    crs: crs,
    zoomControl: false
});
L.control.zoom({ position: 'topright'}).addTo(map);
var single_image = false;
if(single_image) {
    L.imageOverlay('BotW-Map_6.jpg', bounds).addTo(map);
} else {
    L.tileLayer(
        "https://objmap.zeldamods.org/game_files/maptex/{z}/{x}/{y}.png",
        {
            attribution: '<a href="https://objmap.zeldamods.org/">Zeldamods Object Map</a>',
            minZoom: MIN_ZOOM,
            maxZoom: MAX_ZOOM,
            tileSize: 256,
        }).addTo(map);
}
var sW = map.unproject([-6000, -5000], 0);
var nE = map.unproject([6000, 5000], 0);
map.setMaxBounds( L.latLngBounds( sW, nE ));

var tr = L.transformation(1.0, 0.0, 1.0, 0.0);

L.control.mousePosition({
    lngFirst: true,
    latFormatter: (x => (-x).toFixed(0)),
}).addTo(map);

// Catch "Almost" clicks for people with fat fingers on touch screens
//   The fingers you have used to dial are too fat ...
//   https://www.youtube.com/watch?v=OqjF7HKSaaI
map.on('almost:click', function(ev) {
    var layer = ev.layer;
    if(layer.openPopup) {
        layer.fire('click', ev);
    }
});

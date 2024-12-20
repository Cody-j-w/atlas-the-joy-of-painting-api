const fs = require('fs');
const readline = require('readline');
const mysql = require('mysql');


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'pass',
    database: 'the_joy_of_painting'
});

connection.connect();

let normalized = [];

const infoIndex = {
    painting_index: 1,
    img_src: 2,
    painting_title: 3,
    season: 4,
    episode: 5,
    num_colors: 6,
    youtube_src: 7,
    colors: 8,
    color_hex: 9
    }

const colorInterface = readline.createInterface({
    input: fs.createReadStream('The Joy Of Painiting - Colors Used'),
    crlfDelay: Infinity
});
let index = 0;
colorInterface.on('line', (line) => {
    if (index > 0) {
        const paintingObject = {};
        const colorsHexes = line.split(/[\[\]]/);
        paintingObject.colors = colorsHexes[1].split(', ');
        paintingObject.color_hex = colorsHexes[3].split(', ');
        const extracted = colorsHexes[0]+colorsHexes[4];
        const otherInfo = extracted.split(',');
        let title = transformTitle(otherInfo[infoIndex['painting_title']]);
        Object.assign(paintingObject, {
            painting_index: otherInfo[infoIndex['painting_index']],
            img_src: otherInfo[infoIndex['img_src']],
            painting_title: title,
            season: otherInfo[infoIndex['season']],
            episode: otherInfo[infoIndex['episode']],
            num_colors: otherInfo[infoIndex['num_colors']],
            youtube_src: otherInfo[infoIndex['youtube_src']]
        });
        normalized.push(paintingObject);
    }
    index += 1;
});

colorInterface.on('close', () => {
    const episodeInterface = readline.createInterface({
        input: fs.createReadStream('The Joy Of Painting - Episode Dates'),
        crlfDelay: Infinity
    });
    
    let episodeTitles = [];
    episodeInterface.on('line', (line) => {
            const extract = line.split(/[\(\)]/);
            let transformedTitle = transformTitle(extract[0]);
            let extractedDate = transformDate(extract[1]);
            episodeTitles.push({
                title: transformedTitle,
                date: extractedDate.date,
                month: extractedDate.month});
            
    });
    
    episodeInterface.on('close', () => { 
        for (painting of normalized) {
            for (episode of episodeTitles) {
                if (episode.title === painting.painting_title) {
                    painting.date = episode.date;
                    painting.month = episode.month;
                }
            }
        }
        for (let i = 0; i < normalized.length; i++){
            if (normalized[i].painting_title !== episodeTitles[i].title) {
                console.log(normalized[i].painting_title);
                console.log(episodeTitles[i].title);
            }
        }
        

        const subjectInterface = readline.createInterface({
            input: fs.createReadStream('The Joy Of Painiting - Subject Matter'),
            crlfDelay: Infinity
        });

        let subjectPaintings = [];
        let subjects = [];
        index = 0;
        subjectInterface.on('line', (line) => {
            const extract = line.split(',');
            if (index == 0) {
                for (let i = 2; i < extract.length; i++) {
                    subjects.push(extract[i]);
                    const sql = `INSERT INTO subjects (subject_name) VALUES ('${extract[i]}')`
                    connection.query(sql, (err) => {
                        if (err) throw err;
                        
                    })
                }
            } else {
                let subjectList = [];
                let painting = {title: transformTitle(extract[1])}
                for (i = 2; i < extract.length; i++){
                    if (extract[i] == 1) {
                        subjectList.push(subjects[i-2]);
                    }
                }
                painting.subjectList = subjectList;
                subjectPaintings.push(painting);
                for (const p of normalized) {
                    for (const subject of subjectPaintings) {
                        if (p.painting_title === subject.title) {
                            p.subjectList = subject.subjectList;
                        }
                    }
                }
            }
            index += 1;
        });

        subjectInterface.on('close', () => {
            let idIndex = 1;
            for (const p of normalized) {
                console.log(p.subjectList);
                const insertion = `INSERT INTO paintings (painting_name, image_src, episode_number, season, video, month_aired, date_aired, painting_index) VALUES ('${p.painting_title}', '${p.img_src}', '${p.episode}', '${p.season}', '${p.youtube_src}', '${p.month}', '${p.date}', '${p.painting_index}');`
                connection.query(insertion, (err, results, fields) => {
                    if (err) {
                        throw err;
                    };
                    const paintingId = results.insertId;
                    for (const color of p.colors) {
                        const colorLookup = transformColors(color);
                        const colorSetter = `SELECT id FROM colors WHERE color_name = '${colorLookup}'`;
                        connection.query(colorSetter, (err, results, fields) => {
                            console.log(results);
                            const tableSetter = `INSERT INTO painting_colors (painting_id, color_id) VALUES (${paintingId}, ${results[0].id})`;
                            connection.query(tableSetter, (err, results, fields) => {
                                if (err) throw err;
                                
                            })
                            
                        })
                    }
                    for (const subject of p.subjectList) {
                        const subjectSetter = `SELECT id FROM subjects WHERE subject_name = '${subject}'`;
                        connection.query(subjectSetter, (err, results, fields) => {
                            if (err) throw err;
                            const subjectTableSetter = `INSERT INTO painting_subjects (painting_id, subject_id) VALUES (${paintingId}, ${results[0].id})`;
                            connection.query(subjectTableSetter, (err, results, fields) => {
                                if (err) throw err;
                            })
                            
                        })
                    }
                });
            }
            
        });
    });
});

function transformTitle(title) {
    let transformedTitle = title.toUpperCase();

    if (transformedTitle.slice (0, 3) == '"""') {
        transformedTitle = transformedTitle.slice(3, -3);
    }
    if (transformedTitle.slice(0, 1) == '"') {
        transformedTitle = transformedTitle.slice(1, -2);
    }
    transformedTitle = transformedTitle.trim();
    transformedTitle = transformedTitle.replace(/-/g, ' '); 
    transformedTitle = transformedTitle.replace(" '", " ");
    transformedTitle = transformedTitle.replace("' ", " ");
    transformedTitle = transformedTitle.replace('GREY', 'GRAY');
    transformedTitle = transformedTitle.replace('WOODMAN', 'WOODSMAN');
    transformedTitle = transformedTitle.replace('SNOWY WHITE', 'SNOWY WINTER');
    transformedTitle = transformedTitle.replace('HIDE AWAY', 'HIDEAWAY');
    transformedTitle = transformedTitle.replace('TRIAL', 'TRAIL');
    transformedTitle = transformedTitle.replace("WINTER'S", 'WINTER');
    transformedTitle = transformedTitle.replace('PASS', 'PATH');
    transformedTitle = transformedTitle.replace('BACK COUNTRY PATH', 'BACK COUNTRY');
    transformedTitle = transformedTitle.replace('BACK COUNTRY', 'BACK COUNTRY PATH');
    transformedTitle = transformedTitle.replace('EVERGREENS', 'EVERGREEN');
    transformedTitle = transformedTitle.replace('EVENING AT SUNSET', 'EVENING SUNSET');
    transformedTitle = transformedTitle.replace('PLACE HOME', 'HOME PLACE');
    transformedTitle = transformedTitle.replace('MT.', 'MOUNT');
    transformedTitle = transformedTitle.replace('&', 'AND');
    transformedTitle = transformedTitle.replace('SNOW FALL', 'SNOWFALL');
    transformedTitle = transformedTitle.replace('SUNLIGHT', 'SUNSHINE');
    transformedTitle = transformedTitle.replace('FOREST DOWN', 'FOREST DAWN');
    transformedTitle = transformedTitle.replace('QUIET MOUNTAINS', 'QUIET MOUNTAIN');
    transformedTitle = transformedTitle.replace(' WOOD SHAPE', '');
    transformedTitle = transformedTitle.replace('PASTEL WINTER', 'WINTER IN PASTEL');
    transformedTitle = transformedTitle.replace("'", "");
    if (transformedTitle.split(' ')[transformedTitle.split(' ').length - 1] == 'OVAL') {
        transformedTitle = transformedTitle.replace(' OVAL', '');
    }
    if (transformedTitle.split(' ')[transformedTitle.split(' ').length - 1] == 'MOUNTAIN') {

        transformedTitle = transformedTitle.replace('MOUNTAIN', 'MOUNTAINS');
    }
    if (transformedTitle.slice(-1) == "'") {
        transformedTitle = transformedTitle.slice(0, -1);
    }
    if (transformedTitle.substring(0, 4) == 'THE ') {
        transformedTitle = transformedTitle.slice(4);
    }
    if (transformedTitle.substring(0, 3) == 'AN ') {
        transformedTitle = transformedTitle.slice(3);
    }
    if (transformedTitle.substring(0, 3) == 'TO ') {
        transformedTitle = transformedTitle.slice(3);
    }
    if (transformedTitle.substring(0, 2) == 'A ') {
        transformedTitle = transformedTitle.slice(2);
    }
    return transformedTitle;
}

function transformDate(date) {
    const months = {
        'January': 1,
        'February': 2,
        'March': 3,
        'April': 4,
        'May': 5,
        'June': 6,
        'July': 7,
        'August': 8,
        'September': 9,
        'October': 10,
        'November': 11,
        'December': 12
        };
    let transformedDate = date.replace(', ', ' ');
    const testDate = transformedDate.split(' ');
    for (const [key, value] of Object.entries(months)) {
        transformedDate = transformedDate.replace(key, value);
    }
    const segmentedDate = transformedDate.split(' ');
    transformedDate = `${segmentedDate[2]}-${segmentedDate[0]}-${segmentedDate[1]}`;
    const monthAndDate = {
        date: transformedDate,
        month: testDate[0]
    };
    return monthAndDate;
}

function transformColors(color) {
    let transformedColor = color.slice(1, -1);
    transformedColor = transformedColor.split('\\')[0];
    return transformedColor;
}

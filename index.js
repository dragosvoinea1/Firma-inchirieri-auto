const express = require("express");
const fs= require('fs');
const path=require('path');
const sharp=require('sharp');
const sass=require('sass');
const ejs=require('ejs');
const {Client} =require('pg');

var client= new Client({database:"proiectweb",
        user:"dragos",
        password:"1234",
        host:"localhost",
        port:5432});
client.connect();

/*client.query("select * from masina", function(err, rez){
   console.log("Eroare BD", err);
    console.log("Rezultat BD", rez);
})*/



app= express();
obGlobal = {
    obErori:null,
    obImagini:null,
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup"),
    optiuniMeniu:[]
}

client.query("select * from unnest(enum_range(null::car_model))", function(err, rezModel){
    if(err){
        console.log(err)
    }
    else{
        obGlobal.optiuniMeniu=rezModel.rows;
    }
})

app= express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());

vectorFoldere=["temp","temp1"]
for(let folder of vectorFoldere){
    //let caleFolder=__dirname+"/"+folder
    let caleFolder=path.join(__dirname, folder)      
    if(!fs.existsSync(caleFolder))
        fs.mkdirSync(caleFolder);//folderele temp1 si temp
}

function compileazaScss(caleScss, caleCss){
    console.log("cale:",caleCss);
    if(!caleCss){
        //let vectorCale=caleScss.split("\\")
        //let numeFisExt=vectorCale[vectorCale.length-1];
        let numeFisExt = path.basename(caleScss);  //de la etapa 6
        let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss=numeFis+".css";
    }
    if(!path.isAbsolute(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss)
    if(!path.isAbsolute(caleCss))
        caleCss = path.join(obGlobal.folderCss, caleCss)
    //let vectorCale=caleCss.split("\\");
    //let numeFisCss=vectorCale[vectorCale.length-1];
    let caleResBackup=path.join(obGlobal.folderBackup, "resurse/css");
    if(!fs.existsSync(caleResBackup))
        fs.mkdirSync(caleResBackup, {recursive:true}); //creeaza recursiv ca sa nu dea eroare
    let numeFisCss=path.basename(caleCss);//de la etapa 6
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup,"resurse/css",numeFisCss ))// +(new Date()).getTime() pt organizare
    }
    rez=sass.compile(caleScss, {"sourceMap":true});
    fs.writeFileSync(caleCss,rez.css)
    console.log("Compilare SCSS",rez);
}

vFisiere = fs.readdirSync(obGlobal.folderScss)
for(let numeFis of vFisiere){
    if(path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}

fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    console.log(eveniment, numeFis);
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})


app.set("view engine", "ejs");

app.use("/resurse", express.static(__dirname+"/resurse")); /*trim toate fisierele statice din resurse*/

app.use("/node_modules", express.static(__dirname+"/node_modules"));

app.use("/*", function(req,res,next){
    res.locals.optiuniMeniu=obGlobal.optiuniMeniu;
    next(); //cu asta va trece mai departe
})

/*app.use(/^\/resurse(\/[a-zA-Z0-9]*(?!\.)[a-zA-Z0-9]*)*$/, function(req,res)
{afisareEroare(res,403);
})*/

app.get("/favicon.ico", function(req,res){
    req.sendFile(__dirname+"/resurse/imagini/favicon.ico");
})

app.get("/ceva", function(req, res){
    console.log("cale", req.url);
    res.send("<h1>altceva</h1> ip:", +req.ip);
})

app.get(["/index", "/","/home"], function(req, res){
    res.render("pagini/index", {ip:req.ip, a:10, b:20, imagini: obGlobal.obImagini.imagini});
})

app.get("/despre", function(req, res){
    res.render("pagini/despre");
})

////////////////////        PRODUSE          ///////////////////////////
app.get("/produse",function(req, res){
    //console.log(req.query)

        client.query("select * from unnest(enum_range(null::car_brand))", function(err, rezCategorie){
            //console.log(err);
            //console.log(rez);
            let conditieWhere="";
        if(req.query.brand)
            conditieWhere=` where brand='${req.query.brand}'`  //"where tip='"+req.query.tip+"'"
        

        client.query("select * from masina "+conditieWhere , function( err, rez){
            console.log(300)
            if(err){
                console.log(err);
                afisareEroare(res, 2);
            }
            else{
                console.log(rez);
                res.render("pagini/produse", {produse:rez.rows, optiuni:rezCategorie.rows});
            }
        });
    })        
});

app.get("/produs/:id",function(req, res){
    console.log(req.params);
    
    client.query(`select * from masina where id=${req.params.id}`, function( err, rezultat){
        if(err){
            console.log(err);
            afisareEroare(res, 2);
        }
        else
            res.render("pagini/produs", {prod:rezultat.rows[0]});
    });
});

//app.get(/ \.ejs$/)
app.get("/*.ejs", function(req, res){
    afisareEroare(res, 400);          //pt 400 bad request
})

app.get("/*", function(req, res){
    console.log("cale:",req.url);
    try{
    res.render("pagini"+req.url, function(err, rezRandare){
        console.log("Eroare: ", err);
        console.log("Rezultat randare:", rezRandare);
        if(err){
            console.log(err);
            if(err.message.startsWith("Failed to lookup view") || err.message.startsWith("Cannot find module")) 
                /*afiseazaEroare(res, {_identificator:404, _titlu:"ceva"});*/
                afisareEroare(res, 404,_titlu="ceva");
            else
                afisareEroare(res);
        }
        else{
            res.send(rezRandare);
        }
    });
    }
    catch(err){
        console.log(err);
        if(err.message.startsWith("Cannot find module")){
            afisareEroare(res, 404, "Fisier resursa negasit");
        }
    }

});


function initErori(){
    var continut = fs.readFileSync(__dirname+"/resurse/json/erori.json").toString("utf-8");
    obGlobal.obErori = JSON.parse(continut);
    let vErori = obGlobal.obErori.info_erori;
    for(let eroare of vErori){
        eroare.imagine="/"+obGlobal.obErori.cale_baza+"/"+eroare.imagine;
    }
}

initErori();

////////////////////////////////////////////////////////////////////////////////////////////
function initImagini(){
    var continut = fs.readFileSync(__dirname+"/resurse/json/galerie.json").toString("utf-8");
    obGlobal.obImagini = JSON.parse(continut);
    let vImagini = obGlobal.obImagini.imagini;
    let caleAbs = path.join(__dirname, obGlobal.obImagini.cale_galerie)
    let caleAbsMediu = path.join(caleAbs, "mediu")
    if(!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);
    for(let imag of vImagini){
        [numeFis, ext] = imag.fisier.split(".");
        imag.fisier_mediu = "/" + path.join(obGlobal.obImagini.cale_galerie, "mediu", numeFis+"webp")
        let caleAbsFisMediu = path.join(__dirname, imag.fisier_mediu)
        sharp(path.join(caleAbs, imag.fisier)).resize(400).toFile(caleAbsFisMediu)
        imag.fisier = "/" + path.join(obGlobal.obImagini.cale_galerie, imag.fisier);
    }
}

initImagini();

/*daca programatorul seteaza titlul, se ia cel din argument
daca nu e setat, se ia cel din json
daca nu avem titlu nici in json se ia titlul de la val default
idem pt celelalte*/ 

function afisareEroare(res, _identificator, _titlu="titlu default", _text, _imagine){
    let vErori = obGlobal.obErori.info_erori;
    /*let eroare = obGlobal.obErori.info_erori.find(function(elemErr){
        return elemErr.identificator == identificator
    });*/
    let eroare = vErori.find(function(elem) {return elem.identificator==_identificator;})
    if(eroare){
        let titlu1 =_titlu == "titlu default" ? (eroare.titlu || _titlu): _titlu;
        let text1 = _text || eroare.text;
        let imagine1 = _imagine || eroare.imagine;
        if(eroare.status)
            res.status(eroare.identificator).render("pagini/eroare", {titlu:titlu1, text:text1, imagine:imagine1 })
            else res.render("pagini/eroare", {titlu:titlu1, text:text1, imagine:imagine1 })
    }
    else{
        let errDef = obGlobal.obErori.eroare_default;
        res.render("pagini/eroare", {titlu:errDef.titlu, 
                                     text:errDef.text, 
                                     imagine:obGlobal.obErori.cale_baza+"/"+errDef.imagine})
    }
}


app.listen(8080);
console.log("Serverul a pornit");
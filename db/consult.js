const Promise = require('bluebird');
const consult={};

    consult.sqlConection =()=>{
        var sqlite3=require('sqlite3').verbose()
        var path = require('path')
        let dbPath=path.resolve(__dirname,'../db/register')

        return new sqlite3.Database(dbPath,sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                console.error(err.message);
            }
            else {
                console.log('Connected to database.');
            }
        });
    }

    consult.sqlInsert=(req, res)=> {
        let person = req.body
        let certificacion = req.body.certificaciones
        let cv = req.body.cvs
        let experiencia = req.body.experiencias
        let profesion = req.body.profesiones
        let licitacion = req.body.licitaciones
        
        console.log("DATA FULL::",licitacion)

        var db = consult.sqlConection()

        if (person.nombre !== ''){
            consult.sqlInsert_Person(person,db).then(
                resp=>{
                    console.log("respond person insert")
                    let id_agregado = resp
                    consult.sqlInsert_Certification(certificacion, id_agregado,db).then(
                        resp=>{
                            console.log("respond certifi insert")
                            consult.sqlInsert_Cv(cv, id_agregado,db).then(
                                resp=>{
                                    console.log("respond cv insert")
                                    consult.sqlInsert_Experience(experiencia, id_agregado,db).then(
                                        resp=>{
                                            console.log("respond experience insert")
                                            consult.sqlInsert_Licitacion(licitacion, id_agregado,db).then(
                                                resp=>{
                                                    console.log("respond licitacion insert")
                                                    consult.sqlInsert_Profesion(profesion, id_agregado,db).then(
                                                        resp=>{
                                                            console.log("respond profesion insert")
                                                            res.json({'message':"Data saved" })
                                                            db.close()
                                                            console.log('Desconnected to the chinook database.');
                                                        }
                                                    )
                                                }
                                            )
                                        }
                                    )
                                }
                            )
                        }
                    )
                }
            )
        }
        else {
            res.json({'message':"No Data Received" })
            console.log("No Data Received")
            console.log('Desconnected to the chinook database.');
            db.close()
        }
    }

    consult.sqlInsert_Person=(person,db)=>{
        let query = `INSERT INTO  PERSONS (persons_ap,nombre,persons_img,persons_type,id_secundary) 
                        VALUES ('${person.persons_ap}','${person.nombre}','${person.persons_img}','${person.persons_type}','${person.id_secundary}');`

        if(person.persons_id){
            query = `UPDATE PERSONS SET persons_ap = '${person.persons_ap}',
                                        nombre = '${person.nombre}',
                                        persons_img = '${person.persons_img}',
                                        status = ${person.status},
                                        persons_type = '${person.persons_type}',
                                        id_secundary = '${person.id_secundary}',
                                        activo = ${person.activo}
                    WHERE persons_id = ${person.persons_id};`
        }

        return new Promise((resolve, reject)=>{
            db.run(query, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err)
                } else {
                    if(!person.persons_id){
                        db.get('SELECT MAX(persons_id) Id FROM PERSONS;', (err,row)=>{
                            if (err) {
                                console.error(err.message);
                                reject(err)
                            }else{resolve(row.Id)}
                        })
                    }else {
                        resolve(person.persons_id)
                    }
                }
            });
        })
    }

    consult.sqlInsert_Certification=(certificacion,person_id,db)=>{
        return new Promise((resolve, reject)=>{
            if (certificacion.length > 0) {
                db.all(`SELECT certification_id FROM CERTIFICATIONS WHERE persons_id = ${person_id}`, (err, row) => {
                    if (err) {
                        console.error(err.message);
                        reject (err)
                    }else{
                        let ides = []
                        certificacion.map(item => ides.push(item.certification_id))
                        let remove = new Promise((resolve,reject)=>{
                            if(row.length > 0){
                                row.map((item, index) => {
                                    let s = ides.includes(item.certification_id)
                                    if(!s){
                                        db.run(`DELETE FROM CERTIFICATIONS WHERE certification_id = '${item.certification_id}'`)
                                    }
                                    if(index === row.length - 1){
                                        resolve("ok")
                                    }
                                })
                            }else {
                                resolve("ok")
                            }
                        })
                        remove.then(resp=>{
                            for (let i = 0; i < certificacion.length; i++) {
                                if (!certificacion[i].certification_id){
                                    db.run(`INSERT INTO CERTIFICATIONS (nombre,persons_id,base64_cert,descripcion) VALUES ('${certificacion[i].nombre}','${person_id}','${certificacion[i].base64_cert}','${certificacion[i].descripcion}')`, (err, row) => {
                                        if (err) {
                                            console.error(err.message);
                                            reject (err)
                                        }else if(i === certificacion.length -1){resolve("ok")}
                                    })
                                }else {
                                    if (!certificacion[i].base64_cert){
                                        db.run(`UPDATE CERTIFICATIONS SET nombre ='${certificacion[i].nombre}',descripcion ='${certificacion[i].descripcion}' WHERE certification_id = '${certificacion[i].certification_id}';`, (err, row) => {
                                            if (err) {
                                                console.error(err.message);
                                                reject (err)
                                            }else if(i === certificacion.length -1){resolve("ok")}
                                        })
                                    }else {
                                        db.run(`UPDATE CERTIFICATIONS SET nombre ='${certificacion[i].nombre}', base64_cert = '${certificacion[i].base64_cert}',descripcion ='${certificacion[i].descripcion}' WHERE certification_id = '${certificacion[i].certification_id}';`, (err, row) => {
                                            if (err) {
                                                console.error(err.message);
                                                reject (err)
                                            }else if(i === certificacion.length -1){resolve("ok")}
                                        })
                                    }
                                }
                            }
                        })
                        
                    }
                })
            }else {
                db.run(`DELETE FROM CERTIFICATIONS WHERE persons_id = '${person_id}'`, (err, row) => {
                    if (err) {
                        console.error(err.message);
                        reject(err)
                    }else{resolve("ok")}
            })
            }
        })
    }

    consult.sqlInsert_Cv=(cv,person_id,db)=>{
        return new Promise((resolve, reject)=>{
            db.get(`SELECT nombre_cv FROM CVS WHERE persons_id == '${person_id}';`,(err,row)=>{
                if (err){
                    console.log(err.message)
                    reject(err)
                }else {
                    if (row === undefined || row === null){
                        if (cv.length !== 0){
                            for (let i = 0; i < cv.length; i++) {
                                db.get(`INSERT INTO CVS (nombre_cv,base64_cv,persons_id) VALUES ('${cv[i].nombre_cv}','${cv[i].base64_cv}','${person_id}')`, (err, row) => {
                                    if (err) {
                                        console.error(err.message);
                                        reject(err)
                                    }else {resolve("ok")}
                                })
                            }
                        }else {resolve("ok")}
                    }else {
                        if(cv.length !== 0){
                            for (let i = 0; i < cv.length; i++) {
                                console.log("---CV::",cv[i])
                                if(cv[i].nombre_cv && cv[i].base64_cv){
                                    db.run(`UPDATE CVS SET 
                                        nombre_cv ='${cv[i].nombre_cv}', 
                                        base64_cv = '${cv[i].base64_cv}' 
                                        WHERE persons_id = '${person_id}';`
                                        , (err, row) => {
                                            if (err) {
                                                console.error(err.message);
                                                reject(err)
                                            }else {resolve("ok")}
                                        })
                                }else {
                                    resolve("ok")
                                }
                                
                                
                            }
                        }else {resolve("ok")}
                    }
                }
            })
        })
    }

    consult.sqlInsert_Experience=(experiencia,person_id,db)=>{
        return new Promise((resolve, reject)=>{
            if(experiencia.length !== 0){
                db.all(`SELECT experience_id FROM EXPERIENCES WHERE persons_id = ${person_id}`, (err, row) => {
                    if (err) {
                        console.error(err.message);
                        reject (err)
                    }else{
                        let ides = []
                        experiencia.map(item => ides.push(item.experience_id))
                        let remove = new Promise((resolve,reject)=>{
                            if(row.length > 0){
                                row.map((item, index) => {
                                    let s = ides.includes(item.experience_id)
                                    if(!s){
                                        db.run(`DELETE FROM EXPERIENCES WHERE experience_id = '${item.experience_id}'`)
                                    }
                                    if(index === row.length - 1){
                                        resolve("ok")
                                    }
                                })
                            }else {
                                resolve("ok")
                            }
                        })
                        remove.then(resp=>{
                            for (let i = 0; i < experiencia.length; i++) {
                                console.log("EXP-1", experiencia[i].experience_id)
                                if(experiencia[i].experience_id){
                                    db.run(
                                        `UPDATE EXPERIENCES
                                         SET nombre = '${experiencia[i].nombre}',
                                             categoria = '${experiencia[i].categoria}',
                                             fecha_inicio = '${experiencia[i].fecha_inicio}',
                                             fecha_fin = '${experiencia[i].fecha_fin}'
                            
                                        ${
                                            experiencia[i].nombre_c_ex && experiencia[i].base64_c_ex? 
                                            `,nombre_c_ex='${experiencia[i].nombre_c_ex}'
                                            ,base64_c_ex = '${experiencia[i].base64_c_ex}'
                                            WHERE experience_id = '${experiencia[i].experience_id}';` 
                                            :`WHERE experience_id = '${experiencia[i].experience_id}';`
                                                    }`
                                        ,
                                        (err, row) => {
                                            if (err) {
                                                console.error(err.message);
                                                reject(err)
                                            }else if(i === experiencia.length-1){resolve("ok")}
                                        })
                                }else{
                                    db.run(`INSERT INTO EXPERIENCES (nombre,persons_id,nombre_c_ex,base64_c_ex,categoria,fecha_inicio,fecha_fin)
                                VALUES ('${experiencia[i].nombre}','${person_id}','${experiencia[i].nombre_c_ex}','${experiencia[i].base64_c_ex}','${experiencia[i].categoria}','${experiencia[i].fecha_inicio}','${experiencia[i].fecha_fin}')`, (err, row) => {
                                        if (err) {
                                            console.error(err.message);
                                            reject(err)
                                        }else {
                                            if (i === (experiencia.length - 1)) {
                                                resolve("ok")
                                            }
                                        }
                                    })
                                }

                            }
                        })
                    }
                })
            }else {
                db.run(`DELETE FROM EXPERIENCES WHERE persons_id = '${person_id}'`, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err)
                }else{resolve("ok")}
            })}
        })
    }

    consult.sqlInsert_Licitacion=(licitacion,person_id,db)=>{
        return new Promise((resolve, reject)=>{
            if (licitacion.length > 0) {
                db.all(`SELECT licitacion_id FROM LICITACIONS WHERE persons_id = '${person_id}'`, (err, row) => {
                    if (err) {
                        console.error(err.message);
                        reject (err)
                    }else{
                        let ides = []
                        console.log("EXP-1", licitacion)
                        licitacion.map(item => ides.push(item.licitacion_id))
                        let remove = new Promise((resolve,reject)=>{
                            if(row.length > 0){
                                row.map((item, index) => {
                                    let s = ides.includes(item.licitacion_id)
                                    if(!s){
                                        db.run(`DELETE FROM LICITACIONS WHERE licitacion_id = '${item.licitacion_id}'`)
                                    }
                                    if(index === row.length - 1){
                                        resolve("ok")
                                    }
                                })
                            }else {
                                resolve("ok")
                            }
                        })
                        remove.then(resp=>{
                            for (let i = 0; i < licitacion.length; i++) {
                                console.log("EXP-1", licitacion[i].licitacion_id)
                                if(licitacion[i].licitacion_id){
                                    db.run(
                                        `UPDATE LICITACIONS
                                         SET nombre = '${licitacion[i].nombre}',
                                             persons_id = ${licitacion[i].persons_id},
                                             active_lic = '${licitacion[i].active_lic}',
                                             descripcion = '${licitacion[i].descripcion}'
                                           WHERE licitacion_id = ${licitacion[i].licitacion_id};`
                                        ,
                                        (err, row) => {
                                            if (err) {
                                                console.error(err.message);
                                                reject(err)
                                            }else if(i === licitacion.length-1){resolve("ok")}
                                        })
                                }else{
                                    db.run(`INSERT INTO LICITACIONS (nombre,persons_id,active_lic,descripcion) 
                                    VALUES ('${licitacion[i].nombre}',${person_id},'${licitacion[i].active_lic}','${licitacion[i].descripcion}')`, (err, row) => {
                                        if (err) {
                                            console.error(err.message);
                                            reject(err)
                                        }else if(i === licitacion.length-1){resolve("ok")}
                                    })
                                }

                            }
                        })
                    }
                })
            }else {
                db.run(`DELETE FROM LICITACIONS WHERE persons_id = '${person_id}'`, (err, row) => {
                    if (err) {
                        console.error(err.message);
                        reject(err)
                    }else{resolve("ok")}
                })
            }
        })
    }

    consult.sqlInsert_Profesion=(profesion,person_id,db)=>{
        return new Promise((resolve, reject)=>{
            if(profesion.length !== 0){
                db.all(`SELECT profesion_id FROM PROFESIONS WHERE persons_id = ${person_id}`, (err, row) => {
                    if (err) {
                        console.error(err.message);
                        reject (err)
                    }else{
                        let ides = []
                        profesion.map(item => ides.push(item.profesion_id))
                        console.log("IDES profesions::",ides)
                        let remove = new Promise((resolve,reject)=>{
                            if(row.length > 0){
                                row.map((item, index) => {
                                    let s = ides.includes(item.profesion_id)
                                    if(!s){
                                        db.run(`DELETE FROM PROFESIONS WHERE profesion_id = '${item.profesion_id}'`)
                                    }
                                    if(index === row.length - 1){
                                        resolve("ok")
                                    }
                                })
                            }else {
                                resolve("ok")
                            }
                        })
                        remove.then(resp=>{
                            for (let i = 0; i < profesion.length; i++) {
                                console.log("EXP-1", profesion[i].profesion_id)
                                if(profesion[i].profesion_id){
                                    db.run(
                                        `UPDATE PROFESIONS
                         SET nombre = '${profesion[i].nombre}',
                             persons_id = '${profesion[i].persons_id}',
                             universidad = '${profesion[i].universidad}',
                             fecha_inicio = '${profesion[i].fecha_inicio}',
                             fecha_fin = '${profesion[i].fecha_fin}'
                            WHERE profesion_id = '${profesion[i].profesion_id}';`
                                        ,
                                        (err, row) => {
                                            if (err) {
                                                console.error(err.message);
                                                reject(err)
                                            }else if(i === profesion.length-1){resolve("ok")}
                                        })
                                }else{
                                    db.run(`INSERT INTO PROFESIONS (nombre,persons_id,universidad,fecha_inicio,fecha_fin) 
                                            VALUES ('${profesion[i].nombre}','${person_id}','${profesion[i].universidad}','${profesion[i].fecha_inicio}','${profesion[i].fecha_fin}')`, (err, row) => {
                                        if (err) {
                                            console.error(err.message);
                                            reject(err)
                                        }else if(i === profesion.length-1){resolve("ok")}
                                    })
                                }

                            }
                        })
                    }
                })
            }else {
                db.run(`DELETE FROM PROFESIONS WHERE persons_id = '${person_id}'`, (err, row) => {
                    if (err) {
                        console.error(err.message);
                        reject(err)
                    }else{resolve("ok")}
                })
                
            }
        })
    }
//********


    consult.sqlDelete=(req,res)=>{
        let person_id = req.body.id;
        var db = consult.sqlConection()

        consult.sqlDelete_Profesion(person_id,db).then(
            resp=>{
                console.log("respond profesion delete")
                consult.sqlDelete_Certification(person_id,db).then(
                    resp=>{
                        console.log("respond certifi delete")
                        consult.sqlDelete_Cv(person_id,db).then(
                            resp=>{
                                console.log("respond cv delete")
                                consult.sqlDelete_Experience(person_id,db).then(
                                    resp=>{
                                        console.log("respond experience delete")
                                        consult.sqlDelete_Licitacion(person_id,db).then(
                                            resp=>{
                                                console.log("respond licitacion delete")
                                                consult.sqlDelete_Person(person_id,db).then(
                                                    resp=>{
                                                        console.log("respond person delete")
                                                        res.json({'message':"Person delete" })
                                                        db.close()
                                                        console.log('Desconnected to the chinook database.');
                                                    }
                                                )
                                            }
                                        )
                                    }
                                )
                            }
                        )
                    }
                )
            }
        )
    }

    consult.sqlDelete_Person=(person_id,db)=>{
        return new Promise((resolve, reject)=>{
            db.run(`delete from PERSONS where persons_id == ${person_id} or id_secundary == ${person_id};`, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err)
                }else {resolve("ok")}
            });
        })
    }

    consult.sqlDelete_Certification=(person_id,db)=>{
        return new Promise((resolve, reject)=>{
            db.run(`delete from CERTIFICATIONS where persons_id == ${person_id};`, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err)
                }else {resolve("ok")}
            });
        })
    }

    consult.sqlDelete_Cv=(person_id,db)=>{
        return new Promise((resolve, reject)=>{
            db.run(`delete from CVS where persons_id == ${person_id};`, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err)
                }else {resolve("ok")}
            });
        })
    }

    consult.sqlDelete_Experience=(person_id,db)=>{
        return new Promise((resolve, reject)=>{
            db.run(`delete from EXPERIENCES where persons_id == ${person_id};`, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err)
                }else {resolve("ok")}
            });
        })
    }

    consult.sqlDelete_Experience_ID=(req,res)=>{
        let experience_id = req.body.id;
        var db = consult.sqlConection()

        const Promise = require('bluebird')
        return new Promise((resolve, reject)=>{
            db.get(`delete from EXPERIENCES where experience_id =='${experience_id}';`, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err)
                }else {
                    resolve(res.json({'message':"Experience delete"}));
                    db.close()
                    console.log('Desconnected to the chinook database.');
                }
            });
        })
    }

    consult.sqlDelete_Licitacion=(person_id,db)=>{
        const Promise = require('bluebird')

        return new Promise((resolve, reject)=>{
            db.run(`delete from LICITACIONS where persons_id == ${person_id};`, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err)
                }else {resolve("ok")}
            });
        })
    }

    consult.sqlDelete_Profesion=(person_id,db)=>{
        const Promise = require('bluebird')

        return new Promise((resolve, reject)=>{
            db.run(`delete from PROFESIONS where persons_id == ${person_id};`, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err)
                }else {resolve("ok")}
            });
        })
    }
    
    
    
    consult.sqlSelect_getList=(req, res)=>{
        var db = consult.sqlConection()
        let Perfiles = []
        return new Promise((resolve, reject)=>{
            db.all('SELECT * FROM PERSONS;', (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err)
                }else {
                    Perfiles = row
                    Perfiles.map( (pe, index) =>{
                        db.all(`SELECT certification_id,nombre,persons_id,descripcion FROM CERTIFICATIONS WHERE persons_id = ${pe.persons_id};`, (err, row) => {
                            if (err) {
                                console.error(err.message);
                                reject(err)
                            }else {
                                pe.certificaciones = row
                                db.all(`SELECT cv_id, nombre_cv,persons_id FROM CVS WHERE persons_id = ${pe.persons_id};`, (err, row) => {
                                    if (err) {
                                        console.error(err.message);
                                        reject(err)
                                    }else {
                                        pe.cvs = row
                                        db.all(`SELECT experience_id,nombre,persons_id,nombre_c_ex,categoria,fecha_inicio,fecha_fin FROM EXPERIENCES WHERE persons_id = ${pe.persons_id};`, (err, row) => {
                                            if (err) {
                                                console.error(err.message);
                                                reject(err)
                                            }else {
                                                pe.experiencias = row
                                                db.all(`SELECT * FROM LICITACIONS WHERE persons_id = ${pe.persons_id};`, (err, row) => {
                                                    if (err) {
                                                        console.error(err.message);
                                                        reject(err)
                                                    }else {
                                                        pe.licitaciones = row
                                                        db.all(`SELECT * FROM PROFESIONS WHERE persons_id = ${pe.persons_id};`, (err, row) => {
                                                            if (err) {
                                                                console.error(err.message);
                                                                reject(err)
                                                            }else {
                                                                pe.profesiones = row
                                                                if(index === Perfiles.length-1){
                                                                    resolve(res.json({data:Perfiles}));
                                                                    db.close()
                                                                    console.log('Desconnected to the chinook database.');
                                                                }
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    })
                }
            });
        })
    };

    
    consult.sqlSelect_getCExperience=(req, res)=>{
        let idUser = req.body.idUser
        let nomE = req.body.nomE
        var db = consult.sqlConection()
        const Promise = require('bluebird')
        let query=`SELECT experience_id, nombre_c_ex as nombre_e, base64_c_ex as base64_e FROM EXPERIENCES WHERE persons_id == '${idUser}' AND nombre = '${nomE}';`
    
        return new Promise((resolve, reject)=>{
            db.all(query, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err)
                }else {
                    resolve(res.json({data:row}));
                    db.close()
                    console.log('Desconnected to the chinook database.');
                }
            });
        })
    };

    consult.sqlSelect_getCExperience_ID=(req, res)=>{
        let idUser = req.body.idUser
        let nomE = req.body.nomE
        var db = consult.sqlConection()
        const Promise = require('bluebird')
        let query=`SELECT nombre, experience_id, nombre_c_ex as nombre_e FROM EXPERIENCES WHERE persons_id == '${idUser}';`
    
        return new Promise((resolve, reject)=>{
            db.all(query, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err)
                }else {
                    resolve(res.json({data:row}));
                    db.close()
                    console.log('Desconnected to the chinook database.');
                }
            });
        })
    };

    consult.sqlSelect_getFile=(req, res)=>{
        let db = consult.sqlConection()
        let doc_id = req.body.doc_id
        let doc_nom = req.body.doc_nom
        let doc_type = req.body.doc_type
        let query= ''
        console.log("TYPE DOC::", doc_type)
        if(doc_type === 'certificado') {
            query = `SELECT nombre as doc_nom, base64_cert as doc_b64
                     FROM CERTIFICATIONS
                     WHERE certification_id = '${doc_id}' AND nombre = '${doc_nom}';`
        }
        if(doc_type === 'cv') {
            query = `SELECT nombre_cv as doc_nom, base64_cv as doc_b64
                     FROM CVS
                     WHERE cv_id = '${doc_id}' AND nombre_cv = '${doc_nom}';`
        }
        if(doc_type === 'experiencia') {
            console.log("TYPE DOC::", doc_type)
            query = `SELECT nombre_c_ex as doc_nom, base64_c_ex as doc_b64
                     FROM EXPERIENCES
                     WHERE experience_id = ${doc_id} AND nombre_c_ex = '${doc_nom}';`
        }

        return new Promise((resolve, reject)=>{
            console.log(query)
            db.all(query, (err, row) => {
                if (err) {
                    console.error(err.message);
                    resolve(res.json({data:[]}));
                }else {
                    resolve(res.json({data:row}));
                    db.close()
                    console.log('Desconnected to the chinook database.');
                }
            });
        })
    };
    
    consult.sqlDeleteCertification=(req,res)=>{
        let certification_id = req.body.id;
        var db = consult.sqlConection()
        
        const Promise = require('bluebird')
        return new Promise((resolve, reject)=>{
            db.get(`delete from CERTIFICATIONS where certification_id =='${certification_id}';`, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err)
                }else {
                    resolve(res.json({'message':"Certification delete"}));
                    db.close()
                    console.log('Desconnected to the chinook database.');
                }
            });
        })
    }

    consult.sqlStatusUpdatePerson=(req, res)=> {
        let person = req.body
        var db = consult.sqlConection()

        let update_person = `UPDATE PERSONS  
                                SET status = '${person.status}'
                                WHERE persons_id = '${person.id}';`

        const Promise = require('bluebird')
        return new Promise((resolve, reject)=>{
            db.run(update_person, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err)
                }else {
                    resolve(res.json({"message":"Satatus Update"}));
                    db.close()
                    console.log('Desconnected to the chinook database.');
                }
            });
        })
    }
    
    consult.sqlSelect_getListUser=(req, res)=>{
        var db = consult.sqlConection()
    
        let query=`select * from USERS ;`

        const Promise = require('bluebird')
        return new Promise((resolve, reject)=>{
            db.all(query, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err)
                }else {
                    resolve(res.json({data:row}));
                    db.close()
                    console.log('Desconnected to the chinook database.');
                }
            });
        })
    };

    consult.sqlInsertUser=(req, res)=>{
        var db = consult.sqlConection()
        var user = req.body
        let qeuery = ''
        let message = "User Inserted"
        if(user.id){
            query = `UPDATE USERS
                     SET user_nom = '${user.nombre}', user_pass = '${user.pass}', user_type = '${user.type}'
                     WHERE user_id = '${user.id}';`
            message = "User Update"
        }
        else{
            query = `insert into USERS (user_nom, user_pass, user_type)  values ('${user.nombre}', '${user.pass}', '${user.type}');`
            message = "User Inserted"
        }

        const Promise = require('bluebird')
        return new Promise((resolve, reject)=>{
            db.run(query, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err)
                }else {
                    resolve(res.json({"message":message}));
                    db.close()
                    console.log('Desconnected to the chinook database.');
                }
            });
        })
    };

    consult.sqlDeleteUser=(req, res)=>{
        var user = req.body
        var db = consult.sqlConection()
        console.log(user)
        let query=`delete from USERS where user_id == '${user.id}';`

        const Promise = require('bluebird')
        return new Promise((resolve, reject)=>{
            db.run(query, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err)
                }else {
                    resolve(res.json({"message":"User Delete"}));
                    db.close()
                    console.log('Desconnected to the chinook database.');
                }
            });
        })
    };

    consult.sql_Login=(req,res)=>{
        let user = req.body;
        var db = consult.sqlConection()

        const Promise = require('bluebird')
        return new Promise((resolve, reject)=>{
            db.get(`SELECT user_id, user_nom, user_type FROM USERS WHERE user_nom == '${user.user}' AND user_pass == '${user.pass}'`,(err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err)
                }else {
                    resolve(res.json({data:row}));
                    db.close()
                    console.log('Desconnected to the chinook database.');
                }
            });
        })
    }

    consult.sqlSelect_getListManual=(req, res)=>{
        var db = consult.sqlConection()
    
        let query=`select * from MANUAL;`
    
        const Promise = require('bluebird')
        return new Promise((resolve, reject)=>{
            db.all(query, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err)
                }else {
                    resolve(res.json(row));
                    db.close()
                    console.log('Desconnected to the chinook database.');
                }
            });
        })
    };
    
    consult.sqlInsertManual=(req, res)=>{
        var db = consult.sqlConection()
        var manual = req.body
        let query=""
        let message = "Manual Inserted"
        if(manual.id){
            query = `UPDATE MANUAL
                     SET nombre = '${manual.nombre}', man_b64 = '${manual.base64}'
                     WHERE man_id = '${manual.id}';`
            message = "Manual Update"
        }
        else{
            query = `insert into MANUAL (nombre, man_b64)  values ('${manual.nombre}', '${manual.base64}');`
            message = "Manual Inserted"
        }

        const Promise = require('bluebird')
        return new Promise((resolve, reject)=>{
            db.run(query, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err)
                }else {
                    resolve(res.json({"message":message}));
                    db.close()
                    console.log('Desconnected to the chinook database.');
                }
            });
        })
    };
    
    consult.sqlDeleteManual=(req, res)=>{
        var manual = req.body
        var db = consult.sqlConection()
    
        let query=`delete from MANUAL where man_id == '${manual.id}';`
    
        const Promise = require('bluebird')
        return new Promise((resolve, reject)=>{
            db.run(query, (err, row) => {
                if (err) {
                    console.error(err.message);
                    reject(err)
                }else {
                    resolve(res.json({"message":"Manual Delete"}));
                    db.close()
                    console.log('Desconnected to the chinook database.');
                }
            });
        })
    };

module.exports= consult;
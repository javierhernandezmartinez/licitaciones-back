const Promise = require('bluebird');
const mariadb = require('mariadb');
const consult={};

    consult.sqlConection =()=>{
        const pool = mariadb.createPool({
            host: 'ds1658.tmddedicated.com',
            port: '3306',
            user: 'appcvprot',
            password: 'AhZai4Eiku6U',
            database: 'appcvprot_system'
        })
        return pool.getConnection()
            .then(conn =>{
                return conn
            })
            .catch(err =>{
                console.log("Error de conexion con MariaDB: ",err)
                return false
            })
    }

    consult.sqlInsert=(req, res)=> {
        let person = req.body
        let certificacion = req.body.certificaciones
        let cv = req.body.cvs
        let experiencia = req.body.experiencias
        let profesion = req.body.profesiones
        let licitacion = req.body.licitaciones
        
        //console.log("DATA FULL::",person)

        var db = consult.sqlConection()

        if (person.nombre !== ''){
            consult.sqlInsert_Person(person,db).then(
                resp=>{
                    console.log("respond person insert", resp)
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
        return new Promise((resolve, reject)=> {
            db.then(conn => {
                if (conn) {
                    conn.query(query)
                        .then((row) => {
                            if (!person.persons_id) {
                                db.then(conn => {
                                    if (conn) {
                                        conn.query('SELECT MAX(persons_id) Id FROM PERSONS;')
                                            .then((row) => {
                                                console.log(row[0].Id)
                                                console.log('Disconnected database.');
                                                resolve(row[0].Id)
                                            }).catch(err => {
                                            console.error(err.message);
                                        })
                                    } else {
                                        console.log("No se pudo conectar")
                                    }
                                })
                            } else {
                                resolve(person.persons_id)
                            }
                            console.log('Disconnected database.');
                        }).catch(err => {
                        console.error(err.message);
                    })
                } else {
                    console.log("No se pudo conectar")
                }
            })
        })
    }

    consult.sqlInsert_Certification=(certificacion,person_id,db)=>{
        return new Promise((resolve, reject)=>{
            if (certificacion.length > 0) {

                db.then(conn=>{
                    if(conn){
                        conn.query(`SELECT certification_id FROM CERTIFICATIONS WHERE persons_id = ${person_id}`)
                            .then((row) => {
                                let ides = []
                                certificacion.map(item => ides.push(item.certification_id))
                                let remove = new Promise((resolve,reject)=>{
                                    if(row.length > 0){
                                        row.map((item, index) => {
                                            let s = ides.includes(item.certification_id)
                                            if(!s){
                                                db.then(conn=>{
                                                    if(conn){
                                                        conn.query(`DELETE FROM CERTIFICATIONS WHERE certification_id = '${item.certification_id}'`)
                                                            .then((row) => {
                                                                console.log('Disconnected database.');
                                                            }).catch(err => {
                                                            console.error(err.message);
                                                        })
                                                    }else {
                                                        console.log("No se pudo conectar")
                                                    }
                                                })
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
                                            db.then(conn=>{
                                                if(conn){
                                                    conn.query(`INSERT INTO CERTIFICATIONS (nombre,persons_id,base64_cert,descripcion) VALUES ('${certificacion[i].nombre}','${person_id}','${certificacion[i].base64_cert}','${certificacion[i].descripcion}')`)
                                                        .then((row) => {
                                                            if(i === certificacion.length -1){
                                                                resolve("ok")
                                                            }
                                                            console.log('Disconnected database.');
                                                        }).catch(err => {
                                                        console.error(err.message);
                                                    })
                                                }else {
                                                    console.log("No se pudo conectar")
                                                }
                                            })
                                        }else {
                                            if (!certificacion[i].base64_cert){
                                                db.then(conn=>{
                                                    if(conn){
                                                        conn.query(`UPDATE CERTIFICATIONS SET nombre ='${certificacion[i].nombre}',descripcion ='${certificacion[i].descripcion}' WHERE certification_id = '${certificacion[i].certification_id}';`)
                                                            .then((row) => {
                                                                if(i === certificacion.length -1){resolve("ok")}
                                                                console.log('Disconnected database.');
                                                            }).catch(err => {
                                                            console.error(err.message);
                                                        })
                                                    }else {
                                                        console.log("No se pudo conectar")
                                                    }
                                                })
                                            }else {
                                                db.then(conn=>{
                                                    if(conn){
                                                        conn.query(`UPDATE CERTIFICATIONS SET nombre ='${certificacion[i].nombre}', base64_cert = '${certificacion[i].base64_cert}',descripcion ='${certificacion[i].descripcion}' WHERE certification_id = '${certificacion[i].certification_id}';`)
                                                            .then((row) => {
                                                                if(i === certificacion.length -1){resolve("ok")}
                                                                console.log('Disconnected database.');
                                                            }).catch(err => {
                                                            console.error(err.message);
                                                        })
                                                    }else {
                                                        console.log("No se pudo conectar")
                                                    }
                                                })
                                            }
                                        }
                                    }
                                })


                                console.log('Disconnected database.');
                            }).catch(err => {
                            console.error(err.message);
                        })
                    }else {
                        console.log("No se pudo conectar")
                    }
                })
            }else {
                db.then(conn=>{
                    if(conn){
                        conn.query(`DELETE FROM CERTIFICATIONS WHERE persons_id = '${person_id}'`)
                            .then((row) => {
                                resolve("ok")
                                console.log('Disconnected database.');
                            }).catch(err => {
                            console.error(err.message);
                        })
                    }else {
                        console.log("No se pudo conectar")
                    }
                })
            }
        })
    }

    consult.sqlInsert_Cv=(cv,person_id,db)=>{
        return new Promise((resolve, reject)=>{
            db.then(conn=>{
                if(conn){
                    conn.query(`SELECT nombre_cv FROM CVS WHERE persons_id = '${person_id}';`)
                        .then((row) => {
                            if (row === undefined || row === null || row.length === 0){
                                if (cv.length !== 0){
                                    for (let i = 0; i < cv.length; i++) {
                                        db.then(conn=>{
                                            if(conn){
                                                conn.query(`INSERT INTO CVS (nombre_cv,base64_cv,persons_id) VALUES ('${cv[i].nombre_cv}','${cv[i].base64_cv}','${person_id}')`)
                                                    .then((row) => {
                                                        resolve("ok")
                                                        console.log('Disconnected database.');
                                                    }).catch(err => {
                                                    console.error(err.message);
                                                })
                                            }else {
                                                console.log("No se pudo conectar")
                                            }
                                        })
                                    }
                                }else {resolve("ok")}
                            }else {
                                if(cv.length !== 0){
                                    for (let i = 0; i < cv.length; i++) {
                                        console.log("---CV::",cv[i])
                                        if(cv[i].nombre_cv && cv[i].base64_cv){
                                            db.then(conn=>{
                                                if(conn){
                                                    conn.query(`UPDATE CVS SET 
                                                                nombre_cv ='${cv[i].nombre_cv}', 
                                                                base64_cv = '${cv[i].base64_cv}' 
                                                                WHERE persons_id = '${person_id}';`
                                                    )
                                                        .then((row) => {
                                                            resolve("ok")
                                                            console.log('Disconnected database.');
                                                        }).catch(err => {
                                                        console.error(err.message);
                                                    })
                                                }else {
                                                    console.log("No se pudo conectar")
                                                }
                                            })
                                        }else {
                                            resolve("ok")
                                        }


                                    }
                                }else {resolve("ok")}
                            }



                            console.log('Disconnected database.');
                        }).catch(err => {
                        console.error(err.message);
                    })
                }else {
                    console.log("No se pudo conectar")
                }
            })
        })
    }

    consult.sqlInsert_Experience=(experiencia,person_id,db)=>{
        return new Promise((resolve, reject)=>{
            if(experiencia.length !== 0){
                db.then(conn=>{
                    if(conn){
                        conn.query(`SELECT experience_id FROM EXPERIENCES WHERE persons_id = ${person_id}`)
                            .then((row) => {
                                let ides = []
                                experiencia.map(item => ides.push(item.experience_id))
                                let remove = new Promise((resolve,reject)=>{
                                    if(row.length > 0){
                                        row.map((item, index) => {
                                            let s = ides.includes(item.experience_id)
                                            if(!s){
                                                db.then(conn=>{
                                                    if(conn){
                                                        conn.query(`DELETE FROM EXPERIENCES WHERE experience_id = '${item.experience_id}'`)
                                                            .then((row) => {
                                                                console.log('Disconnected database.');
                                                            }).catch(err => {
                                                            console.error(err.message);
                                                        })
                                                    }else {
                                                        console.log("No se pudo conectar")
                                                    }
                                                })
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
                                            db.then(conn=>{
                                                if(conn){
                                                    conn.query(`UPDATE EXPERIENCES
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
                                                    }`)
                                                        .then((row) => {
                                                            if(i === experiencia.length-1){resolve("ok")}
                                                            console.log('Disconnected database.');
                                                        }).catch(err => {
                                                        console.error(err.message);
                                                    })
                                                }else {
                                                    console.log("No se pudo conectar")
                                                }
                                            })
                                        }else{
                                            db.then(conn=>{
                                                if(conn){
                                                    conn.query(`INSERT INTO EXPERIENCES (nombre,persons_id,nombre_c_ex,base64_c_ex,categoria,fecha_inicio,fecha_fin)
                                VALUES ('${experiencia[i].nombre}','${person_id}','${experiencia[i].nombre_c_ex}','${experiencia[i].base64_c_ex}','${experiencia[i].categoria}','${experiencia[i].fecha_inicio}','${experiencia[i].fecha_fin}')`)
                                                        .then((row) => {
                                                            if (i === (experiencia.length - 1)) {
                                                                resolve("ok")
                                                            }
                                                            console.log('Disconnected database.');
                                                        }).catch(err => {
                                                        console.error(err.message);
                                                    })
                                                }else {
                                                    console.log("No se pudo conectar")
                                                }
                                            })
                                        }

                                    }
                                })
                                console.log('Disconnected database.');
                            }).catch(err => {
                            console.error(err.message);
                        })
                    }else {
                        console.log("No se pudo conectar")
                    }
                })
            }else{
                db.then(conn=>{
                    if(conn){
                        conn.query(`DELETE FROM EXPERIENCES WHERE persons_id = '${person_id}'`)
                            .then((row) => {
                                resolve("ok")
                                console.log('Disconnected database.');
                            }).catch(err => {
                            console.error(err.message);
                        })
                    }else {
                        console.log("No se pudo conectar")
                    }
                })
        }
        })
    }

    consult.sqlInsert_Licitacion=(licitacion,person_id,db)=>{
        return new Promise((resolve, reject)=>{
            if (licitacion.length > 0) {
                db.then(conn=>{
                    if(conn){
                        conn.query(`SELECT licitacion_id FROM LICITACIONS WHERE persons_id = '${person_id}'`)
                            .then((row) => {
                                let ides = []
                                console.log("EXP-1", licitacion)
                                licitacion.map(item => ides.push(item.licitacion_id))
                                let remove = new Promise((resolve,reject)=>{
                                    if(row.length > 0){
                                        row.map((item, index) => {
                                            let s = ides.includes(item.licitacion_id)
                                            if(!s){
                                                db.then(conn=>{
                                                    if(conn){
                                                        conn.query(`DELETE FROM LICITACIONS WHERE licitacion_id = '${item.licitacion_id}'`)
                                                            .then((row) => {
                                                                console.log('Disconnected database.');
                                                            }).catch(err => {
                                                            console.error(err.message);
                                                        })
                                                    }else {
                                                        console.log("No se pudo conectar")
                                                    }
                                                })
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
                                            db.then(conn=>{
                                                if(conn){
                                                    conn.query(`UPDATE LICITACIONS
                                         SET nombre = '${licitacion[i].nombre}',
                                             persons_id = ${licitacion[i].persons_id},
                                             active_lic = '${licitacion[i].active_lic}',
                                             descripcion = '${licitacion[i].descripcion}'
                                           WHERE licitacion_id = ${licitacion[i].licitacion_id};`)
                                                        .then((row) => {
                                                            if(i === licitacion.length-1){resolve("ok")}
                                                            console.log('Disconnected database.');
                                                        }).catch(err => {
                                                        console.error(err.message);
                                                    })
                                                }else {
                                                    console.log("No se pudo conectar")
                                                }
                                            })
                                        }else{
                                            db.then(conn=>{
                                                if(conn){
                                                    conn.query(`INSERT INTO LICITACIONS (nombre,persons_id,active_lic,descripcion) 
                                    VALUES ('${licitacion[i].nombre}',${person_id},'${licitacion[i].active_lic}','${licitacion[i].descripcion}')`)
                                                        .then((row) => {
                                                            if(i === licitacion.length-1){resolve("ok")}
                                                            console.log('Disconnected database.');
                                                        }).catch(err => {
                                                        console.error(err.message);
                                                    })
                                                }else {
                                                    console.log("No se pudo conectar")
                                                }
                                            })
                                        }

                                    }
                                })
                                console.log('Disconnected database.');
                            }).catch(err => {
                            console.error(err.message);
                        })
                    }else {
                        console.log("No se pudo conectar")
                    }
                })
            }else {
                db.then(conn=>{
                    if(conn){
                        conn.query(`DELETE FROM LICITACIONS WHERE persons_id = '${person_id}'`)
                            .then((row) => {
                                resolve("ok")
                                console.log('Disconnected database.');
                            }).catch(err => {
                            console.error(err.message);
                        })
                    }else {
                        console.log("No se pudo conectar")
                    }
                })
            }
        })
    }

    consult.sqlInsert_Profesion=(profesion,person_id,db)=>{
        return new Promise((resolve, reject)=>{
            if(profesion.length !== 0){
                db.then(conn=>{
                    if(conn){
                        conn.query(`SELECT profesion_id FROM PROFESIONS WHERE persons_id = ${person_id}`)
                            .then((row) => {
                                let ides = []
                                profesion.map(item => ides.push(item.profesion_id))
                                console.log("IDES profesions::",ides)
                                let remove = new Promise((resolve,reject)=>{
                                    if(row.length > 0){
                                        row.map((item, index) => {
                                            let s = ides.includes(item.profesion_id)
                                            if(!s){
                                                db.then(conn=>{
                                                    if(conn){
                                                        conn.query(`DELETE FROM PROFESIONS WHERE profesion_id = '${item.profesion_id}'`)
                                                            .then((row) => {
                                                                console.log('Disconnected database.');
                                                            }).catch(err => {
                                                            console.error(err.message);
                                                        })
                                                    }else {
                                                        console.log("No se pudo conectar")
                                                    }
                                                })
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
                                            db.then(conn=>{
                                                if(conn){
                                                    conn.query(`UPDATE PROFESIONS
                                                                 SET nombre = '${profesion[i].nombre}',
                                                                     persons_id = '${profesion[i].persons_id}',
                                                                     universidad = '${profesion[i].universidad}',
                                                                     fecha_inicio = '${profesion[i].fecha_inicio}',
                                                                     fecha_fin = '${profesion[i].fecha_fin}'
                                                                    WHERE profesion_id = '${profesion[i].profesion_id}';`)
                                                        .then((row) => {
                                                            if(i === profesion.length-1){resolve("ok")}
                                                            console.log('Disconnected database.');
                                                        }).catch(err => {
                                                        console.error(err.message);
                                                    })
                                                }else {
                                                    console.log("No se pudo conectar")
                                                }
                                            })
                                        }else{
                                            db.then(conn=>{
                                                if(conn){
                                                    conn.query(`INSERT INTO PROFESIONS (nombre,persons_id,universidad,fecha_inicio,fecha_fin) 
                                            VALUES ('${profesion[i].nombre}','${person_id}','${profesion[i].universidad}','${profesion[i].fecha_inicio}','${profesion[i].fecha_fin}')`)
                                                        .then((row) => {
                                                            if(i === profesion.length-1){resolve("ok")}
                                                            console.log('Disconnected database.');
                                                        }).catch(err => {
                                                        console.error(err.message);
                                                    })
                                                }else {
                                                    console.log("No se pudo conectar")
                                                }
                                            })
                                        }

                                    }
                                })
                                console.log('Disconnected database.');
                            }).catch(err => {
                            console.error(err.message);
                        })
                    }else {
                        console.log("No se pudo conectar")
                    }
                })
            }else {
                db.then(conn=>{
                    if(conn){
                        conn.query(`DELETE FROM PROFESIONS WHERE persons_id = '${person_id}'`)
                            .then((row) => {
                                resolve("ok")
                                console.log('Disconnected database.');
                            }).catch(err => {
                            console.error(err.message);
                        })
                    }else {
                        console.log("No se pudo conectar")
                    }
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
            db.then(conn=>{
                if(conn){
                    conn.query(`delete from PERSONS where persons_id = ${person_id} or id_secundary = ${person_id};`)
                        .then((row) => {
                            resolve("ok")
                            console.log('Disconnected database.');
                        }).catch(err => {
                        console.error(err.message);
                    })
                }else {
                    console.log("No se pudo conectar")
                }
            })
        })
    }

    consult.sqlDelete_Certification=(person_id,db)=>{
        return new Promise((resolve, reject)=>{
            db.then(conn=>{
                if(conn){
                    conn.query(`delete from CERTIFICATIONS where persons_id = ${person_id};`)
                        .then((row) => {
                            resolve("ok")
                            console.log('Disconnected database.');
                        }).catch(err => {
                        console.error(err.message);
                    })
                }else {
                    console.log("No se pudo conectar")
                }
            })
        })
    }

    consult.sqlDelete_Cv=(person_id,db)=>{
        return new Promise((resolve, reject)=>{
            db.then(conn=>{
                if(conn){
                    conn.query(`delete from CVS where persons_id = ${person_id};`)
                        .then((row) => {
                            resolve("ok")
                            console.log('Disconnected database.');
                        }).catch(err => {
                        console.error(err.message);
                    })
                }else {
                    console.log("No se pudo conectar")
                }
            })
        })
    }

    consult.sqlDelete_Experience=(person_id,db)=>{
        return new Promise((resolve, reject)=>{
            db.then(conn=>{
                if(conn){
                    conn.query(`delete from EXPERIENCES where persons_id = ${person_id};`)
                        .then((row) => {
                            resolve("ok")
                            console.log('Disconnected database.');
                        }).catch(err => {
                        console.error(err.message);
                    })
                }else {
                    console.log("No se pudo conectar")
                }
            })
        })
    }

    consult.sqlDelete_Experience_ID=(req,res)=>{
        let experience_id = req.body.id;
        var db = consult.sqlConection()

        return new Promise((resolve, reject)=>{
            db.then(conn=>{
                if(conn){
                    conn.query(`delete from EXPERIENCES where experience_id ='${experience_id}';`)
                        .then((row) => {
                            resolve(res.json({'message':"Experience delete"}));
                            console.log('Disconnected database.');
                        }).catch(err => {
                        console.error(err.message);
                    })
                }else {
                    console.log("No se pudo conectar")
                }
            })
        })
    }

    consult.sqlDelete_Licitacion=(person_id,db)=>{

        return new Promise((resolve, reject)=>{
            db.then(conn=>{
                if(conn){
                    conn.query(`delete from LICITACIONS where persons_id = ${person_id};`)
                        .then((row) => {
                            resolve("ok")
                            console.log('Disconnected database.');
                        }).catch(err => {
                        console.error(err.message);
                    })
                }else {
                    console.log("No se pudo conectar")
                }
            })
        })
    }

    consult.sqlDelete_Profesion=(person_id,db)=>{

        return new Promise((resolve, reject)=>{
            db.then(conn=>{
                if(conn){
                    conn.query(`delete from PROFESIONS where persons_id = ${person_id};`)
                        .then((row) => {
                            resolve("ok")
                            console.log('Disconnected database.');
                        }).catch(err => {
                        console.error(err.message);
                    })
                }else {
                    console.log("No se pudo conectar")
                }
            })
        })
    }

    consult.sqlSelect_getList=(req, res)=>{
        var db = consult.sqlConection()
        let Perfiles = []
        return new Promise((resolve, reject)=>{
            db.then(conn=>{
                if(conn){
                    conn.query('SELECT * FROM PERSONS;')
                        .then((row) => {
                            Perfiles = row
                            Perfiles.map( (pe, index) =>{
                                db.then(conn=>{
                                    if(conn){
                                        conn.query(`SELECT certification_id,nombre,persons_id,descripcion FROM CERTIFICATIONS WHERE persons_id = ${pe.persons_id};`)
                                            .then((row) => {
                                                pe.certificaciones = row
                                                db.then(conn=>{
                                                    if(conn){
                                                        conn.query(`SELECT cv_id, nombre_cv,persons_id FROM CVS WHERE persons_id = ${pe.persons_id};`)
                                                            .then((row) => {
                                                                pe.cvs = row
                                                                db.then(conn=>{
                                                                    if(conn){
                                                                        conn.query(`SELECT experience_id,nombre,persons_id,nombre_c_ex,categoria,fecha_inicio,fecha_fin FROM EXPERIENCES WHERE persons_id = ${pe.persons_id};`)
                                                                            .then((row) => {
                                                                                pe.experiencias = row
                                                                                db.then(conn=>{
                                                                                    if(conn){
                                                                                        conn.query(`SELECT * FROM LICITACIONS WHERE persons_id = ${pe.persons_id};`)
                                                                                            .then((row) => {
                                                                                                pe.licitaciones = row
                                                                                                db.then(conn=>{
                                                                                                    if(conn){
                                                                                                        conn.query(`SELECT * FROM PROFESIONS WHERE persons_id = ${pe.persons_id};`)
                                                                                                            .then((row) => {
                                                                                                                pe.profesiones = row
                                                                                                                if(index === Perfiles.length-1){
                                                                                                                    resolve(res.json({data:Perfiles}));
                                                                                                                    console.log('Desconnected to the chinook database.');
                                                                                                                }
                                                                                                                console.log('Disconnected database.');
                                                                                                            }).catch(err => {
                                                                                                            console.error(err.message);
                                                                                                        })
                                                                                                    }else {
                                                                                                        console.log("No se pudo conectar")
                                                                                                    }
                                                                                                })
                                                                                                console.log('Disconnected database.');
                                                                                            }).catch(err => {
                                                                                            console.error(err.message);
                                                                                        })
                                                                                    }else {
                                                                                        console.log("No se pudo conectar")
                                                                                    }
                                                                                })
                                                                                console.log('Disconnected database.');
                                                                            }).catch(err => {
                                                                            console.error(err.message);
                                                                        })
                                                                    }else {
                                                                        console.log("No se pudo conectar")
                                                                    }
                                                                })
                                                                console.log('Disconnected database.');
                                                            }).catch(err => {
                                                            console.error(err.message);
                                                        })
                                                    }else {
                                                        console.log("No se pudo conectar")
                                                    }
                                                })
                                                console.log('Disconnected database.');
                                            }).catch(err => {
                                            console.error(err.message);
                                        })
                                    }else {
                                        console.log("No se pudo conectar")
                                    }
                                })
                            })
                            console.log('Disconnected database.');
                        }).catch(err => {
                        console.error(err.message);
                    })
                }else {
                    console.log("No se pudo conectar")
                }
            })
        })
    };

    consult.sqlSelect_getCExperience=(req, res)=>{
        let idUser = req.body.idUser
        let nomE = req.body.nomE
        var db = consult.sqlConection()
        let query=`SELECT experience_id, nombre_c_ex as nombre_e, base64_c_ex as base64_e FROM EXPERIENCES WHERE persons_id = '${idUser}' AND nombre = '${nomE}';`

        db.then(conn=>{
            if(conn){
                conn.query(query)
                    .then((row) => {
                        res.json({data:row});
                        console.log('Disconnected database.');
                    }).catch(err => {
                    console.error(err.message);
                })
            }else {
                console.log("No se pudo conectar")
            }
        })
    };

    consult.sqlSelect_getCExperience_ID=(req, res)=>{
        let idUser = req.body.idUser
        let db = consult.sqlConection()
        let query=`SELECT nombre, experience_id, nombre_c_ex as nombre_e FROM EXPERIENCES WHERE persons_id = '${idUser}';`

        db.then(conn=>{
            if(conn){
                conn.query(query)
                    .then((row) => {
                        res.json({data:row});
                        console.log('Disconnected database.');
                    }).catch(err => {
                    console.error(err.message);
                })
            }else {
                console.log("No se pudo conectar")
            }
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

        db.then(conn=>{
            if(conn){
                conn.query(query)
                    .then((row) => {
                        res.json({data:row});
                        console.log('Disconnected database.');
                    }).catch(err => {
                    console.error(err.message);
                    res.json({data:[]})
                })
            }else {
                console.log("No se pudo conectar")
            }
        })
    };
    
    consult.sqlDeleteCertification=(req,res)=>{
        let certification_id = req.body.id;
        var db = consult.sqlConection()

        let query = `delete from CERTIFICATIONS where certification_id ='${certification_id}';`
        db.then(conn=>{
            if(conn){
                conn.query(query)
                    .then((row) => {
                        res.json({message:"Certification delete"});
                        console.log('Disconnected database.');
                    }).catch(err => {
                    console.error(err.message);
                })
            }else {
                console.log("No se pudo conectar")
            }
        })
    }

    consult.sqlStatusUpdatePerson=(req, res)=> {
        let person = req.body
        var db = consult.sqlConection()

        let query = `UPDATE PERSONS  
                        SET status = '${person.status}'
                        WHERE persons_id = '${person.id}';`
        db.then(conn=>{
            if(conn){
                conn.query(query)
                    .then((row) => {
                        res.json({message:"Estatus Update"});
                        console.log('Disconnected database.');
                    }).catch(err => {
                    console.error(err.message);
                })
            }else {
                console.log("No se pudo conectar")
            }
        })
    }
    
    consult.sqlSelect_getListUser=(req, res)=>{
        var db = consult.sqlConection()
    
        let query=`select * from USERS ;`

        db.then(conn=>{
            if(conn){
                conn.query(query)
                    .then((row) => {
                        res.json({data: row});
                        console.log('Disconnected database.');
                    }).catch(err => {
                    console.error(err.message);
                })
            }else {
                console.log("No se pudo conectar")
            }
        })
    };

    consult.sqlInsertUser=(req, res)=>{
        var db = consult.sqlConection()
        var user = req.body
        let query = ''
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

        db.then(conn=>{
            if(conn){
                conn.query(query)
                    .then((row) => {
                        res.json({message:message});
                        console.log('Disconnected database.');
                    }).catch(err => {
                    console.error(err.message);
                })
            }else {
                console.log("No se pudo conectar")
            }
        })
    };

    consult.sqlDeleteUser=(req, res)=>{
        var user = req.body
        var db = consult.sqlConection()
        console.log(user)
        let query=`delete from USERS where user_id = '${user.id}';`

        db.then(conn=>{
            if(conn){
                conn.query(query)
                    .then((row) => {
                        res.json({message:"User Delete"});
                        console.log('Disconnected database.');
                    }).catch(err => {
                    console.error(err.message);
                })
            }else {
                console.log("No se pudo conectar")
            }
        })
    };

    consult.sql_Login=(req,res)=>{
        let user = req.body;
        let db = consult.sqlConection()
        let query = `SELECT user_id, user_nom, user_type FROM USERS WHERE user_nom = '${user.user}' AND user_pass = '${user.pass}'`
        db.then(conn=>{
            if(conn){
                conn.query(query)
                    .then((row) => {
                        res.json({data:row});
                        console.log('Disconnected database.');
                    }).catch(err => {
                    console.error(err.message);
                })
            }else {
                console.log("No se pudo conectar")
            }
        })
    }

    consult.sqlSelect_getListManual=(req, res)=>{
        var db = consult.sqlConection()
        let query=`select * from MANUAL;`

        db.then(conn=>{
            if(conn){
                conn.query(query)
                    .then((row) => {
                        res.json(row);
                        console.log('Disconnected database.');
                    }).catch(err => {
                    console.error(err.message);
                })
            }else {
                console.log("No se pudo conectar")
            }
        })
    };
    
    consult.sqlInsertManual=(req, res)=>{
        var db = consult.sqlConection()
        var manual = req.body
        let query=""
        let message = "Manual guardado"
        if(manual.id){
            query = `UPDATE MANUAL
                     SET nombre = '${manual.nombre}', man_b64 = '${manual.base64}'
                     WHERE man_id = '${manual.id}';`
            message = "Manual actualizado"
        }
        else{
            query = `insert into MANUAL (nombre, man_b64)  values ('${manual.nombre}', '${manual.base64}');`
            message = "Manual guardado"
        }

        db.then(conn=>{
            if(conn){
                conn.query(query)
                    .then((row) => {
                        res.json({message:message});
                        console.log('Disconnected database.');
                    }).catch(err => {
                    console.error(err.message);
                })
            }else {
                console.log("No se pudo conectar")
            }
        })
    };
    
    consult.sqlDeleteManual=(req, res)=>{
        var manual = req.body
        var db = consult.sqlConection()
    
        let query=`delete from MANUAL where man_id = '${manual.id}';`

        db.then(conn=>{
            if(conn){
                conn.query(query)
                    .then((row) => {
                        res.json({message:"Manual eliminado"});
                        console.log('Disconnected database.');
                    }).catch(err => {
                    console.error(err.message);
                })
            }else {
                console.log("No se pudo conectar")
            }
        })
    };

module.exports= consult;
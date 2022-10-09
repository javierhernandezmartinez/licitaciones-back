var express = require('express');
var router = express.Router();
const sqlQuery = require('../db/consult')


/* GET users listing. */
router.get('/getList', sqlQuery.sqlSelect_getList);//recupera todos los registros
router.post('/insert', sqlQuery.sqlInsert);//inserta todos los registros
router.post('/delete', sqlQuery.sqlDelete);//Elimina todos los registros e un usuario
router.post('/getCExperience', sqlQuery.sqlSelect_getCExperience);//recupera cv
router.post('/getCExperience_id', sqlQuery.sqlSelect_getCExperience_ID);//recupera experience
router.post('/delete/certification', sqlQuery.sqlDeleteCertification);//elimina un certificado
router.post('/delete/experience/id', sqlQuery.sqlDelete_Experience_ID);//elimina un experience

router.post('/get/file', sqlQuery.sqlSelect_getFile);//recupera certificado
router.post('/get/login', sqlQuery.sql_Login);//login
router.post('/status/update/person', sqlQuery.sqlStatusUpdatePerson);//delete logic

router.get('/getList/user', sqlQuery.sqlSelect_getListUser);//recupera todos los registros de usuarios
router.post('/insert/user', sqlQuery.sqlInsertUser);//inserta un usuario
router.post('/delete/user', sqlQuery.sqlDeleteUser);//Elimina un usuario

router.get('/getList/manual', sqlQuery.sqlSelect_getListManual);//recupera un manual
router.post('/insert/manual', sqlQuery.sqlInsertManual);//inserta un manual
router.post('/delete/manual', sqlQuery.sqlDeleteManual);//Elimina un manual

module.exports = router;
import { Injectable } from '@angular/core';
import { SQLiteObject, SQLite } from '@ionic-native/sqlite';

export class UserProfile {
  idUsuarioVant: number;
  nombreDePerfil: string;
  nombre: string;
  apellido: string;
  email: string;
  edad: number;
  sexo: string;
  tipoDoc: number;
  nroDoc: string;
  calle: string;
  nro: string;
  piso: string;
  dpto: string; 
  provincia: number;
  localidad: number;
  telefono: string;
  usuario: string;
  pass: string;
  fotoPerfil: string;
 
  constructor() {
    
  }
}


@Injectable()
export class DbProvider {

  // public properties

  db: SQLiteObject = null;
  
  constructor(public sqlite: SQLite) {}

  // public methods
  

  setDatabase(db: SQLiteObject){
    if(this.db === null){
      this.db = db;
    }
  } 

  
    /*let sql = 'CREATE TABLE IF NOT EXISTS persona(id_persona, nombre TEXT, apellido TEXT, ';
    sql = sql + 'email TEXT, id_tipo_documento INTEGER, nro_documento INTEGER, edad INTEGER, sexo CHAR, calle TEXT, '; 
    sql = sql + 'numero TEXT, piso TEXT, dpto TEXT, provincia TEXT, localidad TEXT, telefono TEXT); ';
    sql = sql + 'CREATE TABLE IF NOT EXISTS usuario_vant(id_usuario INTEGER, id_persona INTEGER, id_rol INTEGER, id_perfil INTEGER, usuario TEXT, pass TEXT);';
    sql = sql + 'CREATE TABLE IF NOT EXISTS perfil(id_perfil INTEGER, foto TEXT, logueado_en_cad INTEGER, nombre_de_perfil TEXT);';

    return this.db.executeSql(sql, []);
  createTable(){
    this.crearTablaPersona().then(response => {
      this.crearTablaUsuarioVant().then(response => {
        this.crearTablaPerfil().then(response => {
          return Promise.resolve(response);
        })
        .catch(error => {return Promise.reject(error);})   
      })
      .catch(error => {return Promise.reject(error);})
    })
    .catch(error => {return Promise.reject(error);})
    return Promise.resolve(true);
  }

  private crearTablaPersona(){
    let sql = 'CREATE TABLE IF NOT EXISTS persona(id_persona, nombre TEXT, apellido TEXT, ';
    sql = sql + 'email TEXT, id_tipo_documento INTEGER, nro_documento INTEGER, edad INTEGER, sexo CHAR, calle TEXT, '; 
    sql = sql + 'numero TEXT, piso TEXT, dpto TEXT, provincia TEXT, localidad TEXT, telefono TEXT)';
    return this.db.executeSql(sql, []);
  }*/

  crearUsuarioPerfil(){
    let sql = 'CREATE TABLE IF NOT EXISTS usuario_perfil(id_usuario INTEGER, nombre_perfil TEXT, nombre TEXT, apellido TEXT, ';
    sql = sql + 'email TEXT, id_tipo_documento INTEGER, nro_documento TEXT, edad INTEGER, sexo CHAR, calle TEXT, '; 
    sql = sql + 'numero TEXT, piso TEXT, dpto TEXT, provincia TEXT, localidad TEXT, telefono TEXT, usuario TEXT, pass TEXT, foto_perfil TEXT)';
    return this.db.executeSql(sql, []);
  }

  crearTablaVant(){
    let sql = 'CREATE TABLE IF NOT EXISTS vant(id_usuario INTEGER, id_vant INTEGER, foto_vant TEXT)';
    return this.db.executeSql(sql, []);
  }

  guardarPerfilUsuario(perfil: UserProfile){
    let sql = 'INSERT INTO usuario_perfil (id_usuario, nombre_perfil, nombre, apellido, email, id_tipo_documento, ' + 
              'nro_documento, edad, sexo, calle, numero, ' +
              'piso, dpto, provincia, localidad, telefono, usuario, pass, foto_perfil) ' +
              'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'

    return this.db.executeSql(sql, [perfil.idUsuarioVant, perfil.nombreDePerfil, perfil.nombre, perfil.apellido, perfil.email,
                                   perfil.tipoDoc, perfil.nroDoc, perfil.edad, perfil.sexo, 
                                   perfil.calle, perfil.nro, perfil.piso, perfil.dpto, perfil.provincia, 
                                   perfil.localidad, perfil.telefono, perfil.usuario, perfil.pass, perfil.fotoPerfil]);
  }

  modificarPerfilUsuario(perfil: UserProfile){
    let sql = 'UPDATE usuario_perfil SET nombre_perfil =?, nombre=?, apellido=?, email=?, ' +
              'id_tipo_documento=?, nro_documento=?, edad=?, sexo=?, calle=?, numero=?, ' +
              'piso=?, dpto=?, provincia=?, localidad=?, telefono=?, usuario=?, pass=?, foto_perfil=? ' +
              'WHERE id_usuario = ?;'

    return this.db.executeSql(sql, [perfil.nombreDePerfil, perfil.nombre, perfil.apellido, perfil.email,
                                   perfil.tipoDoc, perfil.nroDoc, perfil.edad, perfil.sexo, 
                                   perfil.calle, perfil.nro, perfil.piso, perfil.dpto, perfil.provincia, 
                                   perfil.localidad, perfil.telefono, perfil.usuario, perfil.pass, perfil.fotoPerfil, perfil.idUsuarioVant]);
  }

  obtenerPerfilUsuario(){
    let sql = 'SELECT id_usuario idUsuarioVant, nombre_perfil nombreDePerfil, nombre, apellido, email, id_tipo_documento tipoDoc, ' + 
              'nro_documento nroDoc, edad, sexo, calle, numero nro, ' +
              'piso, dpto, provincia, localidad, telefono, usuario, pass, foto_perfil fotoPerfil ' +
              'FROM usuario_perfil ' +
              "WHERE pass is not null AND pass <> '' AND usuario is not null AND usuario <> '';";

    return this.db.executeSql(sql, []);

  }

  obtenerPerfilNoLog(user){
    let sql = 'SELECT id_usuario idUsuarioVant, nombre_perfil nombreDePerfil, nombre, apellido, email, id_tipo_documento tipoDoc, ' + 
              'nro_documento nroDoc, edad, sexo, calle, numero nro, ' +
              'piso, dpto, provincia, localidad, telefono, usuario, pass, foto_perfil fotoPerfil ' +
              'FROM usuario_perfil ' +
              "WHERE usuario = ?;";

    return this.db.executeSql(sql, [user]);
  }
  

  login(user, pass){
    let sql = 'UPDATE usuario_perfil SET pass=?' +
              'WHERE usuario = ?;'
    return this.db.executeSql(sql, [pass, user]);
  }

  logout(user){
    let sql = 'UPDATE usuario_perfil SET pass=?' +
              'WHERE usuario = ?;'
    return this.db.executeSql(sql, [null, user]);
  }

  obtenerVantsUsuario(idUsuarioVant){    
    let sql = 'SELECT id_usuario idUsuarioVant, id_vant idVant, foto_vant foto FROM vant ' +
              "WHERE id_usuario = ?;";
    return this.db.executeSql(sql, [idUsuarioVant])
          .then(response => {
            let vants = [];
            for (let index = 0; index < response.rows.length; index++) {
              vants.push(response.rows.item(index));
            }
            return Promise.resolve(vants);
          })
          .catch(error => {return Promise.reject(error)});
  }

  guardarFotoVant(vant: any, foto: string){
    let sql = 'INSERT INTO vant (id_usuario, id_vant, foto_vant) ' +
              'VALUES (?, ?, ?)'
    return this.db.executeSql(sql, [vant.idUsuarioVant, vant.idVant, foto]);
  }

  modificarFotoVant(vant: any, foto: string){
    let sql = 'UPDATE vant SET foto_vant=?' +
              'WHERE id_vant = ?;'
    return this.db.executeSql(sql, [foto, vant.idVant]);
  }

  eliminarFotoVant(vant: any){
    let sql = 'DELETE FROM vant ' +
              'WHERE id_vant = ?;'
    return this.db.executeSql(sql, [vant.idVant]);
  }

  /*
  private crearTablaUsuarioVant(){
    let sql = 'CREATE TABLE usuario_vant(id_usuario INTEGER, id_persona INTEGER, id_rol INTEGER, id_perfil INTEGER, usuario TEXT, pass TEXT)';
    return this.db.executeSql(sql, []);
  }

  private crearTablaPerfil(){
    let sql = 'CREATE TABLE IF NOT EXISTS perfil(id_perfil INTEGER, foto TEXT, logueado_en_cad INTEGER, nombre_de_perfil TEXT)';
    return this.db.executeSql(sql, []);
  }

  delete(task: any){
    let sql = 'DELETE FROM tasks WHERE id=?';
    return this.db.executeSql(sql, [task.id]);
  }

  getAll(){
    let sql = 'SELECT * FROM tasks';
    return this.db.executeSql(sql, [])
    .then(response => {
      let tasks = [];
      for (let index = 0; index < response.rows.length; index++) {
        tasks.push( response.rows.item(index) );
      }
      return Promise.resolve( tasks );
    })
    .catch(error => Promise.reject(error));
  }

  update(task: any){
    let sql = 'UPDATE tasks SET title=?, completed=? WHERE id=?';
    return this.db.executeSql(sql, [task.title, task.completed, task.id]);
  }
 
  getUserProfile(){
    let sql = 'SELECT us.id_usuario, us.id_rol, us.usuario, us.pass, pers.*, perf.* ' +
              'FROM usuario_vant us ' +
              'INNER JOIN persona pers ON us.id_persona = pers.id_persona ' +
              'INNER JOIN perfil perf ON us.id_perfil = perf.id_perfil';
    return this.db.executeSql(sql, [])
    .then(response => {
      let usuarios = [];
      if(response.rows){
        for (let index = 0; index < response.rows.length; index++) {
          usuarios.push( response.rows.item(index) );
        }
      }
      return Promise.resolve(usuarios);
    })
    .catch(error => Promise.reject(error));
  }

  private insertarPersona(persona: any){
    let sql = 'INSERT INTO persona (id_persona, nombre, apellido, email, id_tipo_documento, ' + 
              'nro_documento, edad, sexo, calle, numero, ' +
              'piso, dpto, provincia, localidad, telefono) ' +
              'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'

    return this.db.executeSql(sql, [persona.id_persona, persona.nombre, persona.apellido, persona.email,
                                   persona.id_tipo_documento, persona.nro_documento, persona.edad, persona.sexo, 
                                   persona.calle, persona.piso, persona.dpto, persona.provincia, persona.localidad]);
  }

  private insertarUsuario(usuario: any){
    let sql = 'INSERT INTO usuario_vant (id_usuario, id_persona, id_rol, id_perfil, usuario, pass) ' +
              'VALUES (?, ?, ?, ?, ?, ?)';
    return this.db.executeSql(sql, [usuario.id_usuario, usuario.id_persona, usuario.id_rol, usuario.id_perfil,
                                   usuario.usuario, usuario.pass]);
  }

  private insertarPerfil(perfil: any){
    let sql = 'INSERT INTO perfil (id_perfil, foto, id_rol, logueado_en_cad,nombre_de_perfil) ' +
              'VALUES (?, ?, ?, ?, ?)';
    return this.db.executeSql(sql, [perfil.id_perfil, perfil.foto, perfil.id_rol, 
                                    perfil.logueado_en_cad, perfil.nombre_de_perfil]);
  }

  crearPerfil(perfil){
    this.insertarPersona(perfil)
    .then(response => {
      this.insertarPerfil(perfil)
      .then(response => {
        return this.insertarUsuario(perfil);        
      })
      .catch(error => Promise.reject(error));
    })
    .catch(error => Promise.reject(error));
  }
*/
}


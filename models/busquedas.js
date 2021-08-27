const fs = require('fs');

const axios = require('axios').default;

class Busquedas {
    historial = [];
    dbPath = './db/database.json';

    constructor() {
        // TODO: leer DB si existe
        this.leerDB();
    }

    get historialCapitalizado() {
        return this.historial.map( (lugar = '', i) => {
            return lugar.split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
        });
    }

    get paramsMapbox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    get paramsOpenWeather() {
        return {
            'appid': process.env.OPENWEATHER_KEY,
            'units': 'metric',
            'lang': 'es'
        }
    }

    async ciudad( lugar = '' ) {

        try {
            // Petición HTTP
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapbox
            });

            const resp = await instance.get();
            return resp.data.features.map( lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                long: lugar.center[0],
                lat: lugar.center[1]
            }));
            
        } catch (error) {
            return [];
        }

    }

    async climaLugar( lat, lon ) {
        try {

            // instance axios.create()
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {
                    lat,
                    lon,
                    ...this.paramsOpenWeather
                },
                
            });

            // resp.data
            const resp = await instance.get();
            const { weather, main } = resp.data;

            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }

        } catch (error) {
            console.log(error);
        }
    }

    agregarHistorial( lugar = '' ) {
        // TODO: prevenir duplicaddos
        if( this.historial.includes( lugar.toLocaleLowerCase() )){
            return;
        }

        // Limitar historial
        this.historial = this.historial.splice(0, 4);

        // Grabar nuevo lugar
        this.historial.unshift( lugar.toLocaleLowerCase() );

        // Grabar en archivo
        this.guardarDB();
    }

    guardarDB() {
        const payload = {
            historial: this.historial,
        };

        fs.writeFileSync( this.dbPath, JSON.stringify( payload ) );
    }

    leerDB() {
        if ( !fs.existsSync( this.dbPath ) ) return;

        const info = fs.readFileSync( this.dbPath, 'utf-8' );
        const data = JSON.parse( info );

        this.historial = data.historial;
    }
}

module.exports = Busquedas;
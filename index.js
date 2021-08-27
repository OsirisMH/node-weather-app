require('dotenv').config();

const { inquirerMenu,
        inquirerPausa,
        leerInput,
        listarLugares
} = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");


const main = async() => {

    const busquedas = new Busquedas(); 
    let option = 0;

    do {
        option = await inquirerMenu();

        switch( option ) {
            case 1:
                // Mostrar mensaje
                const termino = await leerInput( 'Ciudad:' );
                
                // Buscar los lugares
                const lugares = await busquedas.ciudad( termino );
                
                // Seleccionar el lugar
                const id = await listarLugares( lugares );
                if( id === '0' ) continue;

                const { nombre, lat, long } = lugares.find( lugar => lugar.id === id ); // Extraer los datos necesarios del objeto

                // Guardar en DB
                busquedas.agregarHistorial( nombre );

                // Datos del clima
                const clima = await busquedas.climaLugar( lat, long );

                //Mostrar resultados
                console.clear();
                console.log( '\nInformación de la ciudad\n'.green );
                console.log( 'Ciudad:', nombre );
                console.log( 'Lat:', lat );
                console.log( 'Long:', long );
                console.log( 'Temperatura:', clima.temp );
                console.log( 'Mínima:', clima.min );
                console.log( 'Máxima:', clima.max);
                console.log( 'Estado del clima:', clima.desc.green );
                break;

            case 2:
                busquedas.historialCapitalizado.forEach( (lugar, index) => {
                    const idx = `${ index + 1 }.`.green;
                    console.log(`${ idx } ${ lugar }`);
                });
                break;

            default:
                break;
        }

        if ( option !== 0 ) await inquirerPausa();
    } while( option !== 0 );
}

main();
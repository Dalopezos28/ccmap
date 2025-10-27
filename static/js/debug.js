/**
 * debug.js
 * Script de depuración para verificar que todo se cargue correctamente
 */

console.log('=== SISTEMA DE DEPURACIÓN COMEDORES CALI ===');

// Verificar que las utilidades estén cargadas
setTimeout(() => {
    console.log('1. Verificando Toast:', typeof Toast !== 'undefined' ? '✅ Cargado' : '❌ No cargado');
    console.log('2. Verificando Modal:', typeof Modal !== 'undefined' ? '✅ Cargado' : '❌ No cargado');
    console.log('3. Verificando FormValidator:', typeof FormValidator !== 'undefined' ? '✅ Cargado' : '❌ No cargado');
    console.log('4. Verificando showToast:', typeof showToast !== 'undefined' ? '✅ Cargado' : '❌ No cargado');
    console.log('5. Verificando getUserLocation:', typeof getUserLocation !== 'undefined' ? '✅ Cargado' : '❌ No cargado');

    // Verificar modales
    const modals = ['modal-comedor', 'modal-alertas', 'modal-donaciones', 'modal-ayuda', 'modal-simple'];
    console.log('\n=== Verificando Modales ===');
    modals.forEach(id => {
        const modal = document.getElementById(id);
        console.log(`${id}:`, modal ? '✅ Encontrado' : '❌ No encontrado');
    });

    // Verificar botones
    const buttons = ['btn-alertas', 'btn-donaciones', 'btn-ayuda', 'btn-mi-ubicacion'];
    console.log('\n=== Verificando Botones ===');
    buttons.forEach(id => {
        const btn = document.getElementById(id);
        console.log(`${id}:`, btn ? '✅ Encontrado' : '❌ No encontrado');
    });

    console.log('\n=== Prueba del Sistema ===');
    console.log('Prueba Toast.info...');
    if (typeof Toast !== 'undefined') {
        Toast.info('Sistema de depuración cargado correctamente');
    }

    console.log('\n=== FIN DE LA DEPURACIÓN ===');
}, 1000);

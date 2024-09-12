export default function HomePage() {
    return (
        <div className="bg-gray-50 min-h-screen flex items-start justify-center py-16">
            <div className="max-w-4xl mx-auto px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Consultorio Odontológico Goya</h1>

                <div className="bg-white rounded-lg shadow-lg p-8 lg:p-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">¡Estamos en Construcción!</h2>
                    <p className="text-lg text-gray-700 leading-relaxed mb-8 text-center">
                        Estamos trabajando para brindarte la mejor experiencia posible.
                        Agradecemos tu paciencia mientras mejoramos nuestros servicios.
                    </p>
                    <div className="flex justify-center mt-8">
                        <img
                            className="h-auto object-contain sombraPng"
                            src="img/underConstruction.png"
                            alt="Logo del consultorio"
                        />
                    </div>
                    <p className="text-lg text-gray-700 leading-relaxed mb-8 text-center flex items-center justify-center">
                        Si tienes alguna consulta sobre turnos o tratamientos, por favor contacta a través de whatapp dando click en el logo. 
                        
                    </p>
                    <a 
                            href="https://wa.me/1568445999" 
                            className="ml-2 m-auto" 
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                         <img className="m-auto h-auto w-28 sombraPngShadow" src="/img/whatApp.png" alt="whatapp logo" />   
                        </a>
                        

                    
                </div>
            </div>
        </div>
    );
}

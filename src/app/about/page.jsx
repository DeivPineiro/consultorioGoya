export default function AboutPage() {
    return (
        <div className="bg-gray-50 min-h-screen flex items-start justify-center py-16">
            <div className="max-w-4xl mx-auto px-6 lg:px-8">               
                <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Sobre Nosotros</h1>
             
                <div className="bg-white rounded-lg shadow-lg p-8 lg:p-12">
                    <p className="text-lg text-gray-700 leading-relaxed mb-8">
                        En nuestro consultorio odontológico familiar, combinamos la tradición y la excelencia de la
                        cultura japonesa con la innovación en el cuidado dental. Con un apellido de renombre en el
                        ámbito odontológico, nos enorgullecemos de ofrecer un servicio de alta calidad que se basa en
                        las últimas técnicas y tecnologías.
                    </p>
                    <p className="text-lg text-gray-700 leading-relaxed mb-8">
                        Nuestro equipo está comprometido con la dedicación y el detalle en cada tratamiento, asegurando
                        que cada paciente reciba una atención personalizada y de primer nivel. Desde tratamientos
                        preventivos hasta procedimientos avanzados, nuestro enfoque integral y nuestro compromiso con la
                        precisión y el cuidado nos distinguen en el campo de la odontología.
                    </p>
                 
                    <div className="flex justify-center">
                        <img
                            className="w-48 h-auto object-contain"
                            src="img/logo/logo.png"
                            alt="Logo del consultorio"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

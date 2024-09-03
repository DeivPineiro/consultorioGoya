export default function AboutPage() {
    return (
        <div>
            <h1 className="invisible">About Page</h1>
            {
                <p className="px-4 pb-10">En nuestro consultorio odontológico familiar, combinamos la tradición y la excelencia de la cultura japonesa con la innovación en el cuidado dental. Con un apellido de renombre en el ámbito odontológico, nos enorgullecemos de ofrecer un servicio de alta calidad que se basa en las últimas técnicas y tecnologías. Nuestro equipo está comprometido con la dedicación y el detalle en cada tratamiento, asegurando que cada paciente reciba una atención personalizada y de primer nivel. Desde tratamientos preventivos hasta procedimientos avanzados, nuestro enfoque integral y nuestro compromiso con la precisión y el cuidado nos distinguen en el campo de la odontología.</p>
            }
            <img className="m-auto logoAbout" src="img/logo/logo.png" alt="logo" />
        </div>
    );
}
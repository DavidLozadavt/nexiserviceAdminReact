import { Container } from '@/components/container';
import { generalSettings } from '@/config';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <Container>
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-2 py-5">
          <div className="flex gap-2 font-normal text-2sm">
            <span className="text-gray-500">{currentYear} &copy;</span>
            <span className="text-gray-600">NexiService</span>
          </div>
          <nav className="flex gap-2 font-normal text-2sm text-gray-600">
            <a href="#" className="hover:text-primary">
              Privacidad
            </a>
            <a href="#" className="hover:text-primary">
              Términos
            </a>
            <a href="#" className="hover:text-primary">
              Contacto
            </a>
          </nav>
        </div>
      </Container>
    </footer>
  );
};

export { Footer };

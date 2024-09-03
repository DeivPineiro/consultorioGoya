import Header from '../components/Header';
import './styles/css.css';

export default function Layout({ children }) {
  return (
    <div>
      <Header />
      <main>{children}</main>      
    </div>
  );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const API_URL = 'http://localhost:3000/api';

function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isRegistering ? '/register' : '/login';

    try {
      const res = await axios.post(`${API_URL}${endpoint}`, formData);
      
      if (isRegistering) {
        alert('Registro exitoso, por favor inicia sesión');
        setIsRegistering(false);
      } else {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('currentUser', res.data.username);
        navigate('/main');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Error de conexión');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>{isRegistering ? 'REGISTRO' : 'LOGIN'}</h1>
          <p className="tagline">GESTIÓN DE PROYECTO</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>USUARIO</label>
            <input type="text" name="username" onChange={handleChange} required />
          </div>
          {isRegistering && (
            <div className="form-group"><label>EMAIL</label><input type="email" name="email" onChange={handleChange} required /></div>
          )}
          <div className="form-group"><label>CONTRASEÑA</label><input type="password" name="password" onChange={handleChange} required /></div>
          {error && <div style={{color: 'red', textAlign: 'center', marginBottom: '10px'}}>{error}</div>}
          <button type="submit" className="btn-login">{isRegistering ? 'REGISTRARSE' : 'ENTRAR'}</button>
        </form>

        <div className="login-footer">
          <p>{isRegistering ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}<button onClick={() => setIsRegistering(!isRegistering)}>{isRegistering ? 'Inicia Sesión' : 'Regístrate aquí'}</button></p>
        </div>
      </div>
    </div>
  );
}
export default Login;
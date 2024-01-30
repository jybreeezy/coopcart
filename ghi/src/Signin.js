import React, { useState } from 'react';
import useToken from '@galvanize-inc/jwtdown-for-react';

function SignInForm() {
  const [state, setState] = useState({ username: '', password: '' });
  const { login } = useToken();

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setState({
      ...state,
      [name]: value
    });
  };

  const handleOnSubmit = async (evt) => {
    evt.preventDefault();
    try {
      await login(state.username, state.password); 
      alert('Login successful');
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  };

  return (
    <div className="form-container sign-in-container">
      <form onSubmit={handleOnSubmit}>
        <h1>Sign in</h1>
        <input 
          type="username" 
          name="username" 
          value={state.username} 
          onChange={handleChange} 
          placeholder="Username" 
        />
        <input 
          type="password" 
          name="password" 
          value={state.password} 
          onChange={handleChange} 
          placeholder="Password" 
        />
        <a href="#">Forgot your password?</a>
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}

export default SignInForm;

import './AuthLayout.css';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout-container">
      {children}
    </div>
  );
};

export default AuthLayout;
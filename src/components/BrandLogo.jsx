import { Link } from "react-router-dom";

export default function BrandLogo({ to = "/" }) {
  const img = (
    <img
      src="/telem-logo.png?v=3"
      alt="מרכז תלם  מתחברים מחדש"
      className="brand-logo-img"
    />
  );

  return (
    <>
      <style>{`
        .brand-logo {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          line-height: 0;
        }
        .brand-logo-img {
          height: clamp(64px, 12vw, 96px);
          width: auto;
          max-width: min(90vw, 320px);
          display: block;
          object-fit: contain;
        }
      `}</style>
      {to ? (
        <Link to={to} className="brand-logo">
          {img}
        </Link>
      ) : (
        <span className="brand-logo">{img}</span>
      )}
    </>
  );
}

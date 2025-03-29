import React from 'react';

interface AppHeaderProps {
  title: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title }) => {
  return (
    <header className="app-header">
      <h1 data-testid="app-title">{title}</h1>
    </header>
  );
};

export default AppHeader; 
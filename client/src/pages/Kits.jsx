import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import EnConstruccion from '../components/ui/EnConstruccion';

const Kits = () => {
  return (
    <div className="p-2">
      <PageHeader
        title="Kits"
        description="Aquí puedes gestionar y revisar kits."
      />
      <EnConstruccion />
    </div>
  );
};

export default Kits;
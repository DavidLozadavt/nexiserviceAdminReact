interface TabHeaderProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

const TabHeader = ({ activeTab, setActiveTab }: TabHeaderProps) => {
    const tabs = [
      { id: "productos", label: "Productos" },
      { id: "servicios", label: "Servicios" },
      { id: "catalogo", label: "Catálogo" },
    ];
  
    return (
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-semibold ${
              activeTab === tab.id
                ? "border-b-2 border-green-500 "
                : "text-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  };
  
  export { TabHeader };
  
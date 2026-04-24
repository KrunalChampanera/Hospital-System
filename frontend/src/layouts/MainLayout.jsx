import Sidebar from "../components/Sidebar"
import Header from "../components/Header"

const MainLayout = ({ children, activeTab, onTabChange, hospitalName }) => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} hospitalName={hospitalName} />

      <div style={{ flex: 1 }}>
        <Header />
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}

export default MainLayout

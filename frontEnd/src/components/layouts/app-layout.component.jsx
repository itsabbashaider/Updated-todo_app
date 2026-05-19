import Sidebar from './sidebar.component';

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="app-main">
        {children}
      </main>
    </div>
  );
}

export default AppLayout;
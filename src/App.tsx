import { useState } from 'react';
import { ItineraryList } from './pages/ItineraryList';
import { ProjectDetails } from './pages/ProjectDetails';
import { CreateItineraryWizard } from './pages/CreateItineraryWizard';

function App() {
  const [currentView, setCurrentView] = useState<'list' | 'project' | 'wizard'>('list');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  const navigateToProject = (projectId: string) => {
    setCurrentProjectId(projectId);
    setCurrentView('project');
  };

  const navigateToList = () => {
    setCurrentView('list');
    setCurrentProjectId(null);
  };

  const navigateToWizard = () => {
    setCurrentView('wizard');
  };

  return (
    <>
      {currentView === 'list' && (
        <ItineraryList onNavigateToProject={navigateToProject} onNavigateToWizard={navigateToWizard} />
      )}
      {currentView === 'project' && currentProjectId && (
        <ProjectDetails projectId={currentProjectId} onBack={navigateToList} />
      )}
      {currentView === 'wizard' && (
        <CreateItineraryWizard 
          onBack={navigateToList}
          onComplete={(projectId) => navigateToProject(projectId)}
        />
      )}
    </>
  );
}

export default App;
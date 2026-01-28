import { useCallback, useMemo } from 'react';
import { ReactTags, Tag } from 'react-tag-autocomplete';
import { SystemSettings, WikiPage } from './types';
import 'react-tag-autocomplete/example/src/styles.css';

interface SystemTabProps {
  settings: SystemSettings;
  onUpdate: (settings: SystemSettings) => void;
  specifications: WikiPage[];
  isLoading: boolean;
}

export function SystemTab({ settings, onUpdate, specifications, isLoading }: SystemTabProps) {
  const handleFieldChange = (field: keyof SystemSettings, value: any) => {
    onUpdate({ ...settings, [field]: value });
  };

  // Convert specifications array to Tag format
  const selectedTags = useMemo<Tag[]>(() => {
    return settings.specifications.map((spec, index) => ({
      value: index,
      label: spec,
    }));
  }, [settings.specifications]);

  // Convert WikiPage array to Tag suggestions
  const suggestions = useMemo<Tag[]>(() => {
    return specifications.map((spec) => ({
      value: spec.page_id,
      label: spec.page_name,
    }));
  }, [specifications]);

  const onAdd = useCallback(
    (newTag: Tag) => {
      const newSpecifications = [...settings.specifications, newTag.label];
      handleFieldChange('specifications', newSpecifications);
    },
    [settings.specifications]
  );

  const onDelete = useCallback(
    (tagIndex: number) => {
      const newSpecifications = settings.specifications.filter(
        (_, index) => index !== tagIndex
      );
      handleFieldChange('specifications', newSpecifications);
    },
    [settings.specifications]
  );

  return (
    <div>
      <div className="form-group">
        <label>Cahiers des charges</label>
        {isLoading ? (
          <p className="help-text">Chargement des cahiers des charges...</p>
        ) : (
          <>
            <ReactTags
              selected={selectedTags}
              suggestions={suggestions}
              onAdd={onAdd}
              onDelete={onDelete}
              placeholderText="Ajouter un cahier des charges..."
              noOptionsText="Aucun cahier des charges trouvé"
              allowNew={false}
            />
            <div className="help-text">
              Sélectionnez les cahiers des charges applicables à ce système (AB, HVE, etc.)
            </div>
          </>
        )}
      </div>

      <div className="checkbox-group">
        <input
          type="checkbox"
          id="irrigation"
          checked={settings.irrigation}
          onChange={(e) => handleFieldChange('irrigation', e.target.checked)}
        />
        <label htmlFor="irrigation">Irrigation</label>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description du système</label>
        <textarea
          id="description"
          value={settings.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="Décrivez les objectifs, contraintes et particularités de ce système..."
        />
      </div>
    </div>
  );
}

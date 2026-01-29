import { useState, useMemo } from 'react';
import { SystemSettings, WikiPage } from './types';
import { LocationMap } from './LocationMap';

interface ContextTabProps {
  settings: SystemSettings;
  onUpdate: (settings: SystemSettings) => void;
  soils: WikiPage[];
  isLoading: boolean;
}

export function ContextTab({ settings, onUpdate, soils, isLoading }: ContextTabProps) {
  const [isCalculatingGPS, setIsCalculatingGPS] = useState(false);
  const [isCalculatingSoil, setIsCalculatingSoil] = useState(false);

  const handleFieldChange = (field: keyof SystemSettings, value: any) => {
    onUpdate({ ...settings, [field]: value });
  };

  // Parse GPS coordinates
  const gpsCoordinates = useMemo(() => {
    if (!settings.gpsLocation) return { lat: null, lng: null };
    const parts = settings.gpsLocation.split(',').map(s => s.trim());
    if (parts.length !== 2) return { lat: null, lng: null };
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (isNaN(lat) || isNaN(lng)) return { lat: null, lng: null };
    return { lat, lng };
  }, [settings.gpsLocation]);

  const handleMapLocationChange = (lat: number, lng: number) => {
    handleFieldChange('gpsLocation', `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  };

  const calculateGPSFromAddress = async () => {
    if (!settings.address.trim()) {
      alert('Veuillez saisir une adresse');
      return;
    }

    setIsCalculatingGPS(true);
    try {
      // Using Nominatim OpenStreetMap API with addressdetails
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(settings.address)}&format=json&addressdetails=1&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const { lat, lon, address } = result;
        
        // Extract department number from postcode (first 2 or 3 characters)
        let deptNo = '';
        if (address.postcode) {
          const postcode = address.postcode.replace(/\s/g, '');
          // Handle Corsica (2A, 2B) and DOM-TOM
          if (postcode.startsWith('20')) {
            deptNo = postcode.substring(0, 2) + (postcode[2] === '0' ? 'A' : 'B');
          } else if (postcode.length === 5) {
            deptNo = postcode.substring(0, 2);
          } else {
            deptNo = postcode.substring(0, 3);
          }
        }
        
        // Get town/city name
        const town = address.city || address.town || address.village || address.municipality || '';
        
        // Update all fields
        onUpdate({
          ...settings,
          gpsLocation: `${lat}, ${lon}`,
          deptNo,
          town
        });
      } else {
        alert('Adresse introuvable');
      }
    } catch (error) {
      console.error('Error calculating GPS:', error);
      alert('Erreur lors du calcul des coordonnées GPS');
    } finally {
      setIsCalculatingGPS(false);
    }
  };

  const calculateSoilFromGPS = async () => {
    if (!settings.gpsLocation.trim()) {
      alert('Veuillez saisir des coordonnées GPS');
      return;
    }

    setIsCalculatingSoil(true);
    try {
      // TODO: Implement soil type calculation from GPS
      // This would require an external API or service
      alert('Fonctionnalité de calcul automatique du type de sol à venir');
    } catch (error) {
      console.error('Error calculating soil type:', error);
      alert('Erreur lors du calcul du type de sol');
    } finally {
      setIsCalculatingSoil(false);
    }
  };

  return (
    <div>
      <div className="form-group">
        <label htmlFor="title">Nom du système *</label>
        <input
          type="text"
          id="title"
          value={settings.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          placeholder="Ex: Rotation blé-colza bio"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="address">Adresse</label>
        <div className="input-with-button">
          <input
            type="text"
            id="address"
            value={settings.address}
            onChange={(e) => handleFieldChange('address', e.target.value)}
            placeholder="Ex: 31000 Toulouse, France"
          />
          <button
            type="button"
            onClick={calculateGPSFromAddress}
            disabled={isCalculatingGPS || !settings.address.trim()}
          >
            {isCalculatingGPS ? 'Calcul...' : 'Calculer GPS'}
          </button>
        </div>
        <div className="help-text">
          Saisissez une adresse pour calculer automatiquement les coordonnées GPS
        </div>
      </div>

      <div className="form-group">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 250px', gap: '1rem' }}>
          <div>
            <label htmlFor="gpsLocation">Coordonnées GPS</label>
            <input
              type="text"
              id="gpsLocation"
              value={settings.gpsLocation}
              onChange={(e) => handleFieldChange('gpsLocation', e.target.value)}
              placeholder="Ex: 43.6047, 1.4442"
            />
            <div className="help-text">
              Format: latitude, longitude (décimal). Déplacez le marqueur sur la carte pour ajuster.
            </div>
          </div>
          <div style={{ height: '200px' }}>
            <LocationMap
              latitude={gpsCoordinates.lat}
              longitude={gpsCoordinates.lng}
              onLocationChange={handleMapLocationChange}
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="surface">Surface (ha) *</label>
        <input
          type="number"
          id="surface"
          value={settings.surface}
          onChange={(e) => handleFieldChange('surface', parseFloat(e.target.value) || 0)}
          placeholder="Ex: 15"
          min="0"
          step="0.01"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="soilType">Type de sol</label>
        <div className="input-with-button">
          <select
            id="soilType"
            value={settings.soilType}
            onChange={(e) => handleFieldChange('soilType', e.target.value)}
            disabled={isLoading}
          >
            <option value="">-- Sélectionner un type de sol --</option>
            {soils.map((soil) => (
              <option key={soil.id} value={soil.page_name}>
                {soil.page_name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={calculateSoilFromGPS}
            disabled={isCalculatingSoil || !settings.gpsLocation.trim()}
          >
            {isCalculatingSoil ? 'Calcul...' : 'Auto'}
          </button>
        </div>
        <div className="help-text">
          {isLoading ? 'Chargement des types de sol...' : 'Sélectionnez le type de sol ou calculez automatiquement'}
        </div>
      </div>
    </div>
  );
}

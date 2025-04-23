import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  SelectChangeEvent,
  IconButton
} from '@mui/material';
import { AddAPhoto, MyLocation, Send, DeleteOutline } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import LocationPicker from './LocationPicker';

// Waste type options
const wasteTypes = [
  { value: 'organic', label: 'Organic Waste' },
  { value: 'plastic', label: 'Plastic' },
  { value: 'paper', label: 'Paper/Cardboard' },
  { value: 'glass', label: 'Glass' },
  { value: 'metal', label: 'Metal' },
  { value: 'electronic', label: 'E-waste' },
  { value: 'medical', label: 'Medical Waste' },
  { value: 'construction', label: 'Construction Debris' },
  { value: 'hazardous', label: 'Hazardous Materials' },
  { value: 'other', label: 'Other' }
];

const ReportForm: React.FC = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    wasteType: '',
    notes: '',
    location: { lat: 0, lng: 0 },
    address: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Function to handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Basic validation for image size and type
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError('Image size should not exceed 5MB');
        return;
      }
      
      if (!file.type.match('image.*')) {
        setError('Please select an image file');
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  // Function to clear selected image
  const clearImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  // Function to get user's current location
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            location: { lat: latitude, lng: longitude }
          }));
          
          // Get address using reverse geocoding (optional)
          fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=YOUR_GOOGLE_MAPS_API_KEY`)
            .then(response => response.json())
            .then(data => {
              if (data.results && data.results[0]) {
                setFormData(prev => ({
                  ...prev,
                  address: data.results[0].formatted_address
                }));
              }
            })
            .catch(error => console.error('Error fetching address:', error))
            .finally(() => setIsGettingLocation(false));
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Could not get your location. Please try again or enter manually.');
          setIsGettingLocation(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setIsGettingLocation(false);
    }
  };

  // Function to handle location selection from map
  const handleLocationSelect = (position: { lat: number, lng: number }, address: string) => {
    setFormData(prev => ({
      ...prev,
      location: position,
      address
    }));
  };

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to submit a report');
      return;
    }
    
    if (!formData.wasteType) {
      setError('Please select a waste type');
      return;
    }
    
    if (!imageFile) {
      setError('Please upload an image of the waste');
      return;
    }
    
    if (formData.location.lat === 0 && formData.location.lng === 0) {
      setError('Please select a location');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Upload image to Firebase Storage
      const storageRef = ref(storage, `waste-images/${Date.now()}_${imageFile.name}`);
      const uploadResult = await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(uploadResult.ref);
      
      // Save the report to Firestore
      await addDoc(collection(db, 'reports'), {
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        wasteType: formData.wasteType,
        notes: formData.notes,
        location: formData.location,
        address: formData.address,
        imageUrl,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      // Reset form after successful submission
      setFormData({
        wasteType: '',
        notes: '',
        location: { lat: 0, lng: 0 },
        address: ''
      });
      clearImage();
      setSuccess(true);
      
    } catch (error) {
      console.error('Error submitting report:', error);
      setError('Failed to submit your report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Clean up image preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom align="center">
        Report Waste Location
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel id="waste-type-label">Waste Type</InputLabel>
              <Select
                labelId="waste-type-label"
                id="wasteType"
                name="wasteType"
                value={formData.wasteType}
                label="Waste Type"
                onChange={handleChange}
              >
                {wasteTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              name="notes"
              label="Additional Notes"
              placeholder="Any details about the waste or location (e.g., 'This is recurring every week')"
              value={formData.notes}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Location
            </Typography>
            <Button
              variant="outlined"
              startIcon={<MyLocation />}
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              sx={{ mb: 2 }}
            >
              {isGettingLocation ? <CircularProgress size={24} /> : "Use My Current Location"}
            </Button>
            
            <LocationPicker
              selectedPosition={formData.location}
              onSelectLocation={handleLocationSelect}
            />
            
            {formData.address && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Address: {formData.address}
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Upload Photo
            </Typography>
            
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="upload-waste-image"
              type="file"
              onChange={handleImageChange}
            />
            
            <label htmlFor="upload-waste-image">
              <Button
                variant="outlined"
                component="span"
                startIcon={<AddAPhoto />}
                sx={{ mb: 2 }}
              >
                Select Image
              </Button>
            </label>
            
            {imagePreview && (
              <Box sx={{ mt: 2, position: 'relative' }}>
                <img
                  src={imagePreview}
                  alt="Waste Preview"
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }}
                />
                <IconButton
                  onClick={clearImage}
                  sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(255, 255, 255, 0.7)' }}
                >
                  <DeleteOutline />
                </IconButton>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              startIcon={<Send />}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Submit Report"}
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success">
          Your waste report has been submitted successfully!
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ReportForm; 
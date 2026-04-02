import { useRef, useState } from 'react';
import { Box, Typography, Avatar, IconButton, Tooltip } from '@mui/material';
import { CloudUpload as UploadIcon, Delete as DeleteIcon, Image as ImageIcon } from '@mui/icons-material';

/**
 * Reusable image uploader — converts file to base64 and calls onChange(base64string)
 * Props:
 *   value      — current base64/url string
 *   onChange   — callback with base64 string
 *   label      — label text shown in drop zone
 *   variant    — 'avatar' | 'rounded' | 'banner'  (shape of preview)
 *   error      — boolean
 *   helperText — string
 */
export default function ImageUpload({ value, onChange, label = 'Upload Image', variant = 'avatar', error = false, helperText = '' }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const convertToBase64 = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    convertToBase64(file);
  };

  const handleInputChange = (e) => {
    handleFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const isRounded = variant === 'rounded';
  const previewSize = isRounded ? 88 : 72;

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />

      {/* Upload Zone */}
      <Box
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          border: '2px dashed',
          borderColor: error ? 'error.main' : dragging ? 'primary.main' : '#d1d5db',
          borderRadius: 3,
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2.5,
          cursor: 'pointer',
          bgcolor: dragging ? 'rgba(99,102,241,0.04)' : '#fafafa',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'rgba(99,102,241,0.04)',
          },
        }}
      >
        {/* Preview or placeholder */}
        {value ? (
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            <Avatar
              src={value}
              variant={isRounded ? 'rounded' : 'circular'}
              sx={{
                width: previewSize,
                height: previewSize,
                borderRadius: isRounded ? 2 : '50%',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Tooltip title="Remove">
              <IconButton
                size="small"
                onClick={handleClear}
                sx={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  bgcolor: '#ef4444',
                  color: '#fff',
                  width: 20,
                  height: 20,
                  '&:hover': { bgcolor: '#dc2626' },
                }}
              >
                <DeleteIcon sx={{ fontSize: 12 }} />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Box sx={{
            width: previewSize,
            height: previewSize,
            borderRadius: isRounded ? 2 : '50%',
            bgcolor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <ImageIcon sx={{ color: '#d1d5db', fontSize: 32 }} />
          </Box>
        )}

        {/* Text instructions */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <UploadIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="body2" fontWeight={600} color="primary.main">
              {value ? 'Change Image' : label}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Click or drag & drop an image here
          </Typography>
          <Typography variant="caption" sx={{ color: '#9ca3af' }}>
            JPG, PNG, GIF, WEBP — max 5MB
          </Typography>
        </Box>
      </Box>

      {helperText && (
        <Typography variant="caption" color={error ? 'error' : 'text.secondary'} sx={{ mt: 0.5, ml: 1.5, display: 'block' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
}

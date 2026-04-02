import { useRef, useState } from 'react';
import { Box, Typography, Avatar, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { CloudUpload as UploadIcon, Close as CloseIcon, Image as ImageIcon } from '@mui/icons-material';

/**
 * Compresses an image file to a small JPEG before returning base64.
 * Max 400×400 px, quality 0.75 — keeps each image well under 50 KB.
 */
const compressImage = (file, maxSize = 400, quality = 0.75) =>
  new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
      const w = Math.round(img.width  * ratio);
      const h = Math.round(img.height * ratio);
      const canvas = document.createElement('canvas');
      canvas.width  = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(''); };
    img.src = url;
  });

/**
 * ImageUpload — click or drag & drop to upload, auto-compress, then base64.
 * Props:
 *   value      — current base64 string
 *   onChange   — callback(base64 string)
 *   label      — label shown in the drop zone
 *   variant    — 'avatar' (circle) | 'rounded' (square)
 *   error      — boolean
 *   helperText — string
 */
export default function ImageUrlInput({
  value,
  onChange,
  label = 'Upload Image',
  variant  = 'avatar',
  error    = false,
  helperText = '',
}) {
  const inputRef = useRef(null);
  const [dragging,  setDragging]  = useState(false);
  const [compressing, setCompressing] = useState(false);

  const isRounded = variant === 'rounded';

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setCompressing(true);
    const base64 = await compressImage(file);
    onChange(base64);
    setCompressing(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      <Box
        onClick={() => !compressing && inputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        sx={{
          border: '1.5px dashed',
          borderColor: error ? 'error.main' : dragging ? 'primary.main' : '#cbd5e1',
          borderRadius: 1.5,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          cursor: compressing ? 'wait' : 'pointer',
          bgcolor: dragging ? '#eff6ff' : '#fafafa',
          transition: 'border-color 0.15s ease, background-color 0.15s ease',
          '&:hover': { borderColor: 'primary.main', bgcolor: '#eff6ff' },
        }}
      >
        {/* Preview / Loader */}
        {compressing ? (
          <Box sx={{
            width: 56, height: 56, borderRadius: isRounded ? 1 : '50%',
            bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <CircularProgress size={24} thickness={4} />
          </Box>
        ) : value ? (
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            <Avatar
              src={value}
              variant={isRounded ? 'rounded' : 'circular'}
              sx={{
                width: 56, height: 56,
                borderRadius: isRounded ? 1 : '50%',
                border: '1px solid #e2e8f0',
              }}
            />
            <Tooltip title="Remove">
              <IconButton
                size="small"
                onClick={handleClear}
                sx={{
                  position: 'absolute', top: -6, right: -6,
                  width: 18, height: 18,
                  bgcolor: 'error.main', color: '#fff',
                  '&:hover': { bgcolor: 'error.dark' },
                }}
              >
                <CloseIcon sx={{ fontSize: 11 }} />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Box sx={{
            width: 56, height: 56, borderRadius: isRounded ? 1 : '50%',
            bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <ImageIcon sx={{ color: '#94a3b8', fontSize: 24 }} />
          </Box>
        )}

        {/* Text */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
            <UploadIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography variant="body2" fontWeight={600} color="primary.main">
              {compressing ? 'Compressing…' : value ? 'Change Image' : label}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Click to browse or drag & drop
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Auto-compressed before saving
          </Typography>
        </Box>
      </Box>

      {helperText && (
        <Typography
          variant="caption"
          color={error ? 'error' : 'text.secondary'}
          sx={{ mt: 0.5, ml: 0.5, display: 'block' }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
}

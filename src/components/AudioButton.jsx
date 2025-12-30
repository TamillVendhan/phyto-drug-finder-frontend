import React, { useState, useCallback } from 'react';
import { FaVolumeUp, FaVolumeMute, FaSpinner } from 'react-icons/fa';

const AudioButton = ({ 
  text, 
  label = "Listen to pronunciation",
  lang = 'en-US',
  rate = 0.9,
  pitch = 1,
  size = 'normal' // small, normal, large
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  // Check if speech synthesis is supported
  React.useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
    }
  }, []);

  const speak = useCallback(() => {
    if (!isSupported || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Get available voices and try to find a suitable one
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith(lang.split('-')[0]) && voice.localService
    ) || voices.find(voice => 
      voice.lang.startsWith(lang.split('-')[0])
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  }, [text, lang, rate, pitch, isSupported]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  const handleClick = () => {
    if (isPlaying) {
      stop();
    } else {
      speak();
    }
  };

  if (!isSupported) {
    return null;
  }

  const sizeClasses = {
    small: 'audio-btn-sm',
    normal: 'audio-btn-md',
    large: 'audio-btn-lg'
  };

  return (
    <button
      type="button"
      className={`audio-btn ${sizeClasses[size]} ${isPlaying ? 'playing' : ''}`}
      onClick={handleClick}
      title={label}
      aria-label={label}
    >
      {isPlaying ? (
        <>
          <FaVolumeMute className="audio-icon" />
          <span className="audio-waves">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </>
      ) : (
        <FaVolumeUp className="audio-icon" />
      )}
    </button>
  );
};

// Pronunciation component for plant names
export const PlantPronunciation = ({ commonName, scientificName }) => {
  return (
    <div className="plant-pronunciation">
      <div className="pronunciation-item">
        <span className="pronunciation-label">Common Name:</span>
        <span className="pronunciation-text">{commonName}</span>
        <AudioButton text={commonName} size="small" />
      </div>
      {scientificName && (
        <div className="pronunciation-item">
          <span className="pronunciation-label">Scientific Name:</span>
          <span className="pronunciation-text italic">{scientificName}</span>
          <AudioButton text={scientificName} size="small" lang="la" rate={0.8} />
        </div>
      )}
    </div>
  );
};

export default AudioButton;
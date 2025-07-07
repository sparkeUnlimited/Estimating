"use client";

import { useState, useEffect, useRef } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

interface AddressAutocompleteProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
}

interface PlacePrediction {
  description: string;
  place_id: string;
}

export default function AddressAutocomplete({
  label = "Address",
  value,
  onChange,
  onSelect,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [options, setOptions] = useState<PlacePrediction[]>([]);
  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.google && !serviceRef.current) {
      serviceRef.current = new window.google.maps.places.AutocompleteService();
    }
  }, []);

  useEffect(() => {
    const fetchPredictions = () => {
      if (!serviceRef.current || !inputValue) {
        setOptions([]);
        return;
      }

      serviceRef.current.getPlacePredictions(
        { input: inputValue, types: ["address"] },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setOptions(predictions);
          } else {
            setOptions([]);
          }
        }
      );
    };

    const debounce = setTimeout(fetchPredictions, 300);
    return () => clearTimeout(debounce);
  }, [inputValue]);

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.description}
      filterOptions={(x) => x} // don’t filter, let Google handle it
      autoComplete
      includeInputInList
      fullWidth
      value={options.find((opt) => opt.description === value) || null}
      onChange={(_, newValue) => {
        if (newValue) {
          onChange(newValue.description);
          if (onSelect) {
            onSelect(newValue.description);
          }
        }
      }}
      inputValue={inputValue}
      onInputChange={(_, newInput, reason) => {
        if (reason === "input") {
          setInputValue(newInput);
          onChange(newInput); // reflects current typing in parent state
        }
      }}
      renderInput={(params) => <TextField {...params} label={label} required />}
    />
  );
}

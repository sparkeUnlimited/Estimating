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

export default function AddressAutocomplete({
  label = "Address",
  value,
  onChange,
  onSelect,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [options, setOptions] = useState<string[]>([]);
  const serviceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).google && !serviceRef.current) {
      serviceRef.current = new (window as any).google.maps.places.AutocompleteService();
    }
  }, []);

  useEffect(() => {
    if (!serviceRef.current || !inputValue) {
      setOptions([]);
      return;
    }

    serviceRef.current.getPlacePredictions({ input: inputValue, types: ["address"] }, (predictions) => {
      setOptions(predictions ? predictions.map((p) => p.description) : []);
    });
  }, [inputValue]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <Autocomplete
      freeSolo
      options={options}
      inputValue={inputValue}
      onInputChange={(_, newInput) => {
        setInputValue(newInput);
        onChange(newInput);
      }}
      value={value}
      onChange={(_, newValue, reason) => {
        const val = newValue || "";
        onChange(val);
        if (reason === "selectOption" && onSelect) {
          onSelect(val);
        }
      }}
      renderInput={(params) => <TextField {...params} label={label} required fullWidth />}    
    />
  );
}

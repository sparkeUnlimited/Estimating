import { useEffect, useRef, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useGoogleMaps } from "@/components/providers/GoogleMapsProvider";

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
  const { loaded } = useGoogleMaps();
  const [inputValue, setInputValue] = useState(value);
  const [options, setOptions] = useState<PlacePrediction[]>([]);
  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null);

  // Keep the displayed input value in sync with the selected value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (loaded && window.google && !serviceRef.current) {
      serviceRef.current = new google.maps.places.AutocompleteService();
    }
  }, [loaded]);

  useEffect(() => {
    if (!serviceRef.current || !inputValue) {
      setOptions([]);
      return;
    }

    const debounce = setTimeout(() => {
      serviceRef.current!.getPlacePredictions(
        { input: inputValue, types: ["address"] },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setOptions(predictions);
          } else {
            setOptions([]);
          }
        }
      );
    }, 300);

    return () => clearTimeout(debounce);
  }, [inputValue]);

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.description}
      filterOptions={(x) => x}
      autoComplete
      includeInputInList
      fullWidth
      value={options.find((opt) => opt.description === value) || null}
      onChange={(_, newValue) => {
        if (newValue) {
          setInputValue(newValue.description);
          onChange(newValue.description);
          if (onSelect) onSelect(newValue.description);
        }
      }}
      inputValue={inputValue}
      onInputChange={(_, newInput, reason) => {
        if (reason === "input") {
          setInputValue(newInput);
          onChange(newInput);
        }
      }}
      renderInput={(params) => <TextField {...params} label={label} required />}
    />
  );
}

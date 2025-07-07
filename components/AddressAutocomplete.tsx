import { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useGoogleMaps } from "@/components/providers/GoogleMapsProvider";

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
  const { loaded } = useGoogleMaps();
  const [inputValue, setInputValue] = useState(value);
  const [options, setOptions] = useState<google.maps.places.PlacePrediction[]>([]);
  const ottawa = { lat: 45.4215, lng: -75.6972 };

  // Keep the displayed input value in sync with the selected value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!loaded || !window.google || !inputValue) {
      setOptions([]);
      return;
    }

    const debounce = setTimeout(() => {
      google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: inputValue,
        includedPrimaryTypes: ["address"],
        includedRegionCodes: ["ca"],
        locationBias: {
          center: { lat: ottawa.lat, lng: ottawa.lng },
          radius: 50000,
        },
      })
        .then(({ suggestions }) => {
          const predictions = suggestions
            .map((s) => s.placePrediction)
            .filter(
              (p): p is google.maps.places.PlacePrediction => p !== null
            );
          setOptions(predictions);
        })
        .catch(() => setOptions([]));
    }, 300);

    return () => clearTimeout(debounce);
  }, [inputValue, loaded]);

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.text.text}
      filterOptions={(x) => x}
      autoComplete
      includeInputInList
      fullWidth
      value={options.find((opt) => opt.text.text === value) || null}
      onChange={(_, newValue) => {
        if (newValue) {
          setInputValue(newValue.text.text);
          onChange(newValue.text.text);
          if (onSelect) onSelect(newValue.text.text);
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

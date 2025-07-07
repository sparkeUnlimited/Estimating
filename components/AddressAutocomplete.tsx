import { useEffect, useState, useRef } from "react";
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
  const [options, setOptions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null);

  const ottawa = new google.maps.LatLng(45.4215, -75.6972);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!loaded || !window.google || !inputValue) {
      setOptions([]);
      return;
    }

    if (!serviceRef.current) {
      serviceRef.current = new google.maps.places.AutocompleteService();
    }

    const debounce = setTimeout(() => {
      serviceRef.current?.getPlacePredictions(
        {
          input: inputValue,
          types: ["address"],
          componentRestrictions: { country: "ca" },
          locationBias: {
            radius: 50000,
            center: ottawa,
          },
        },
        (predictions) => {
          if (predictions) {
            setOptions(predictions);
          } else {
            setOptions([]);
          }
        }
      );
    }, 300);

    return () => clearTimeout(debounce);
  }, [inputValue, loaded]);

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.description}
      filterOptions={(x) => x} // Disable built-in filtering
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

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  List,
  ListItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

type Props = {
  totalFloors: number;
};

const calculateModifier = (floor: number): number => {
  if (floor <= 3) return 1.0;
  const increaseFactor = Math.floor((floor - 1) / 3);
  return parseFloat((1 + increaseFactor * 0.03).toFixed(2));
};

export default function HighRiseLabourAdjuster({ totalFloors }: Props) {
  const [selectedFloors, setSelectedFloors] = useState<number[]>([]);
  const [inputFloor, setInputFloor] = useState<number>(0);

  useEffect(() => {
    setSelectedFloors([]);
    setInputFloor(0);
  }, [totalFloors]);

  const handleAddFloor = () => {
    if (
      inputFloor > 0 &&
      inputFloor <= totalFloors &&
      !selectedFloors.includes(inputFloor)
    ) {
      setSelectedFloors([...selectedFloors, inputFloor].sort((a, b) => a - b));
    }
    setInputFloor(0);
  };

  if (totalFloors <= 3) return null;

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        High-Rise Labour Adjustment
      </Typography>
      <Box>
        <Stack direction="row" spacing={2} alignItems="center" my={2}>
          <TextField
            label="Enter working floor"
            type="number"
            value={inputFloor || ""}
            onChange={(e) => setInputFloor(parseInt(e.target.value))}
            size="small"
          />
          <Button onClick={handleAddFloor} variant="contained">
            Add Floor
          </Button>
        </Stack>
        {selectedFloors.length > 0 && (
          <>
            <Typography variant="subtitle1">
              Labour Modifiers for Selected Floors:
            </Typography>
            <List dense>
              {selectedFloors.map((floor) => (
                <ListItem key={floor}>
                  Floor {floor}: {calculateModifier(floor)}x labour
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Box>
    </Box>
  );
}

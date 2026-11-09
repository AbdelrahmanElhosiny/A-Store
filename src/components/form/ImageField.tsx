import { useId, useRef, useState } from "react";
import styled from "@emotion/styled";
import { useField } from "formik";
import { Button } from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import font from "../../styles/font";
import { color } from "../../styles/tokens";
import readImage from "../../utils/readImage";

// bigger files are almost certainly not product photos
const MAX_FILE_MB = 15;

interface Props {
  name: string;
  label: string;
}

// -----------------
// JSX
// -----------------
// Picks a picture (button, or drag and drop on desktop), shrinks it
// and keeps it in the Formik field as a data URL.
const ImageField: React.FC<Props> = ({ name, label }) => {
  const [field, , helpers] = useField<string>(name);
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const labelId = useId();
  const image = field.value;

  const pickFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file isn't a picture. Try a JPG, PNG or WebP.");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`That picture is over ${MAX_FILE_MB} MB. Try a smaller one.`);
      return;
    }
    setError("");
    setIsBusy(true);
    try {
      await helpers.setValue(await readImage(file));
    } catch {
      setError("Couldn't read that picture. Try another one.");
    } finally {
      setIsBusy(false);
    }
  };

  const openPicker = () => inputRef.current?.click();
  const removeImage = () => {
    helpers.setValue("");
    setError("");
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    pickFile(event.dataTransfer.files[0]);
  };

  return (
    <Holder role="group" aria-labelledby={labelId}>
      <span className="label" id={labelId}>
        {label}
      </span>

      <div
        className={`frame${isDragOver ? " drag-over" : ""}${image ? " filled" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        // a click on the empty frame opens the picker too (the button
        // below is the keyboard way in)
        onClick={image || isBusy ? undefined : openPicker}
      >
        {image ? (
          <img src={image} alt="Preview of the picked picture" />
        ) : (
          <div className="empty">
            <AddPhotoAlternateOutlinedIcon className="icon" />
            <span className="drop-hint">Drop a picture here, or</span>
          </div>
        )}
      </div>

      <div className="buttons">
        <Button variant="outlined" onClick={openPicker} disabled={isBusy}>
          {isBusy ? "Preparing…" : image ? "Change picture" : "Choose picture"}
        </Button>
        {image && (
          <Button color="error" onClick={removeImage} disabled={isBusy}>
            Remove
          </Button>
        )}
      </div>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          pickFile(event.target.files?.[0]);
          // lets the same file be picked again after Remove
          event.target.value = "";
        }}
      />
    </Holder>
  );
};

// -----------------
// Styled component
// -----------------
const Holder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-s);

  .label {
    ${font.Bold}
    font-size: 0.9rem;
    color: ${color.fgMuted};
  }

  .frame {
    width: min(100%, 320px);
    aspect-ratio: 4 / 3;
    display: grid;
    place-items: center;
    overflow: hidden;
    background-color: ${color.bg1};
    border: 2px dashed ${color.bg2};
    transition: border-color 0.2s ease;
    cursor: pointer;

    &.filled {
      cursor: default;
      border-style: solid;
    }
    &.drag-over {
      border-color: ${color.primary};
      border-style: solid;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-s);
    color: ${color.fgMuted};
    text-align: center;
    padding: var(--space-m);

    .icon {
      font-size: 2.5rem;
      color: ${color.primary};
    }
  }

  /* phones can't drag files in */
  @media (hover: none) {
    .drop-hint {
      display: none;
    }
  }

  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-s);
  }

  .error {
    margin: 0;
    color: ${color.red};
    font-size: 0.9rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .frame {
      transition: none;
    }
  }
`;

export default ImageField;

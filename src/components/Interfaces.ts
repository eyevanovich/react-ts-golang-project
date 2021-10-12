interface Movie {
    id: number;
    title: string;
    description: string;
    year: number;
    release_date: string;
    runtime: number;
    rating: number;
    mpaa_rating: string;
    genres: string
}

interface Genre {
    id: number;
    genre_name: string;
}

interface InputProps {
    title: string
    type: string
    id: string
    name: string
    value: string | number
    handleChange: (evt: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLTextAreaElement>) => void
    placeholder: string
    className: string
    errorDiv: string
    errorMsg: string
}

interface SelectProps {
    title: string
    id: string
    name: string
    value: string | number
    handleChange: (evt: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLTextAreaElement>) => void
    placeholder: string
    options: MPAAOptions[]
}

interface MPAAOptions {
    id: string
    value: string
}

interface GenreProps {
    id: string
}

interface AlertProps {
    alertType: string
    alertMessage: string
}

export type {
    Movie,
    Genre,
    InputProps,
    GenreProps,
    SelectProps,
    MPAAOptions,
    AlertProps
}
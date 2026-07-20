import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, BookOpen } from "lucide-react";
import {
    addBook, updateBook,
    fetchBookById, selectBook, selectBookLoading, clearBook
} from "../../features/books/bookSlice.js";
import axiosInstance from "../../api/axiosInstance.js";
import Spinner from "../../components/common/Spinner.jsx";

// ── Validation schema ─────────────────────────────────────────────────────
const bookSchema = z.object({
    title:         z.string().min(1, "Title is required"),
    isbn:          z.string().min(10, "Enter a valid ISBN"),
    author:        z.string().min(1,  "Author is required"),
    category:      z.string().optional(),
    publisher:     z.string().optional(),
    publishedYear: z.coerce.number()
                    .min(1000, "Enter a valid year")
                    .max(new Date().getFullYear(), "Year cannot be in the future")
                    .optional()
                    .or(z.literal("")),
    description:   z.string().optional(),
    totalCopies:   z.coerce.number().min(1, "At least 1 copy required"),
    language:      z.string().optional(),
    pages:         z.coerce.number().min(1).optional().or(z.literal("")),
    location:      z.string().optional(),
    tags:          z.string().optional(),   // comma-separated, split before sending
});

const BookForm = () => {
    const { id }    = useParams();        // id exists = edit mode
    const isEdit    = Boolean(id);
    const dispatch  = useDispatch();
    const navigate  = useNavigate();
    const book      = useSelector(selectBook);
    const loading   = useSelector(selectBookLoading);

    const [authors,     setAuthors]     = useState([]);
    const [categories,  setCategories]  = useState([]);
    const [coverPreview, setCoverPreview] = useState(null);
    const [coverFile,    setCoverFile]    = useState(null);
    const [fetching,     setFetching]     = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({ resolver: zodResolver(bookSchema) });

    // ── Fetch authors + categories for dropdowns ──────────────────────
    useEffect(() => {
        const fetchOptions = async () => {
            setFetching(true);
            try {
                const [authRes, catRes] = await Promise.all([
                    axiosInstance.get("/authors", { params: { limit: 100 } }),
                    axiosInstance.get("/categories"),
                ]);
                setAuthors(authRes.data.data     || []);
                setCategories(catRes.data.data   || []);
            } catch {
                // silently fail — dropdowns just stay empty
            } finally {
                setFetching(false);
            }
        };
        fetchOptions();
    }, []);

    // ── In edit mode: fetch existing book and pre-fill form ───────────
    useEffect(() => {
        if (isEdit) {
            dispatch(fetchBookById(id));
        }
        return () => dispatch(clearBook());
    }, [dispatch, id, isEdit]);

    // pre-fill form when book data arrives
    useEffect(() => {
        if (isEdit && book) {
            reset({
                title:         book.title         || "",
                isbn:          book.isbn           || "",
                author:        book.author?._id    || "",
                category:      book.category?._id  || "",
                publisher:     book.publisher      || "",
                publishedYear: book.publishedYear  || "",
                description:   book.description    || "",
                totalCopies:   book.totalCopies    || 1,
                language:      book.language       || "English",
                pages:         book.pages          || "",
                location:      book.location       || "",
                tags:          book.tags?.join(", ") || "",
            });
            if (book.coverImage) setCoverPreview(book.coverImage);
        }
    }, [book, isEdit, reset]);

    // ── Cover image preview ───────────────────────────────────────────
    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    // ── Submit ────────────────────────────────────────────────────────
    const onSubmit = async (data) => {
        // convert tags string to array
        const tags = data.tags
            ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [];

        // use FormData so cover image file can be sent
        const formData = new FormData();
        Object.entries({ ...data, tags: JSON.stringify(tags) }).forEach(
            ([key, value]) => {
                if (value !== "" && value !== undefined) {
                    formData.append(key, value);
                }
            }
        );
        if (coverFile) formData.append("coverImage", coverFile);

        const result = isEdit
            ? await dispatch(updateBook({ id, data: formData }))
            : await dispatch(addBook(formData));

        const action = isEdit ? updateBook : addBook;
        if (action.fulfilled.match(result)) {
            navigate(isEdit ? `/books/${id}` : "/books");
        }
    };

    if ((isEdit && loading && !book) || fetching) return <Spinner />;

    return (
        <div className="max-w-3xl mx-auto space-y-6">

            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500
                               transition-colors"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEdit ? "Edit Book" : "Add New Book"}
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {isEdit ? "Update book details" : "Add a new book to the catalogue"}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* ── Cover image ────────────────────────────────────── */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">
                        Cover Image
                    </h2>
                    <div className="flex items-center gap-5">
                        {/* Preview */}
                        <div className="w-24 h-32 rounded-lg bg-gray-100 border
                                        border-gray-200 overflow-hidden flex items-center
                                        justify-center shrink-0">
                            {coverPreview ? (
                                <img
                                    src={coverPreview}
                                    alt="Cover preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <BookOpen size={24} className="text-gray-300" />
                            )}
                        </div>
                        {/* Upload button */}
                        <div>
                            <label
                                htmlFor="coverImage"
                                className="flex items-center gap-2 px-4 py-2 border
                                           border-gray-300 rounded-lg text-sm font-medium
                                           text-gray-600 hover:border-blue-500
                                           hover:text-blue-600 cursor-pointer transition-colors"
                            >
                                <Upload size={15} />
                                {coverPreview ? "Change image" : "Upload image"}
                            </label>
                            <input
                                id="coverImage"
                                type="file"
                                accept="image/*"
                                onChange={handleCoverChange}
                                className="hidden"
                            />
                            <p className="text-xs text-gray-400 mt-1.5">
                                JPG, PNG up to 5MB
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Basic info ─────────────────────────────────────── */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-700">
                        Basic Information
                    </h2>

                    {/* Title */}
                    <Field label="Title *" error={errors.title}>
                        <input
                            {...register("title")}
                            placeholder="e.g. Atomic Habits"
                            className={inputCls(errors.title)}
                        />
                    </Field>

                    {/* Author */}
                    <Field label="Author *" error={errors.author}>
                        <select {...register("author")} className={inputCls(errors.author)}>
                            <option value="">Select author</option>
                            {authors.map((a) => (
                                <option key={a._id} value={a._id}>
                                    {a.name}
                                </option>
                            ))}
                        </select>
                    </Field>

                    {/* ISBN */}
                    <Field label="ISBN *" error={errors.isbn}>
                        <input
                            {...register("isbn")}
                            placeholder="978-3-16-148410-0"
                            className={inputCls(errors.isbn)}
                        />
                    </Field>

                    {/* Category */}
                    <Field label="Category" error={errors.category}>
                        <select
                            {...register("category")}
                            className={inputCls(errors.category)}
                        >
                            <option value="">Select category</option>
                            {categories.map((c) => (
                                <option key={c._id} value={c._id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </Field>

                    {/* Description */}
                    <Field label="Description" error={errors.description}>
                        <textarea
                            {...register("description")}
                            rows={3}
                            placeholder="Brief synopsis of the book..."
                            className={`${inputCls(errors.description)} resize-none`}
                        />
                    </Field>
                </div>

                {/* ── Publication details ────────────────────────────── */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-700">
                        Publication Details
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Publisher" error={errors.publisher}>
                            <input
                                {...register("publisher")}
                                placeholder="e.g. Penguin Books"
                                className={inputCls(errors.publisher)}
                            />
                        </Field>
                        <Field label="Published Year" error={errors.publishedYear}>
                            <input
                                {...register("publishedYear")}
                                type="number"
                                placeholder={new Date().getFullYear()}
                                className={inputCls(errors.publishedYear)}
                            />
                        </Field>
                        <Field label="Pages" error={errors.pages}>
                            <input
                                {...register("pages")}
                                type="number"
                                placeholder="320"
                                className={inputCls(errors.pages)}
                            />
                        </Field>
                        <Field label="Language" error={errors.language}>
                            <select
                                {...register("language")}
                                className={inputCls(errors.language)}
                            >
                                <option value="English">English</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Marathi">Marathi</option>
                                <option value="Gujarati">Gujarati</option>
                            </select>
                        </Field>
                    </div>
                </div>

                {/* ── Inventory ──────────────────────────────────────── */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-700">
                        Inventory
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Total Copies *" error={errors.totalCopies}>
                            <input
                                {...register("totalCopies")}
                                type="number"
                                min={1}
                                defaultValue={1}
                                className={inputCls(errors.totalCopies)}
                            />
                        </Field>
                        <Field label="Shelf Location" error={errors.location}>
                            <input
                                {...register("location")}
                                placeholder="e.g. A-12, Row 3"
                                className={inputCls(errors.location)}
                            />
                        </Field>
                    </div>

                    <Field label="Tags (comma separated)" error={errors.tags}>
                        <input
                            {...register("tags")}
                            placeholder="self-help, productivity, habits"
                            className={inputCls(errors.tags)}
                        />
                    </Field>
                </div>

                {/* ── Actions ────────────────────────────────────────── */}
                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-5 py-2.5 text-sm font-medium text-gray-600
                                   border border-gray-300 rounded-lg hover:bg-gray-50
                                   transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-5 py-2.5 text-sm font-medium text-white
                                   bg-blue-600 hover:bg-blue-700 rounded-lg
                                   disabled:bg-blue-400 disabled:cursor-not-allowed
                                   transition-colors"
                    >
                        {isSubmitting
                            ? (isEdit ? "Saving…" : "Adding…")
                            : (isEdit ? "Save Changes" : "Add Book")
                        }
                    </button>
                </div>

            </form>
        </div>
    );
};

// ── Reusable field wrapper ────────────────────────────────────────────────
const Field = ({ label, error, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
        </label>
        {children}
        {error && (
            <p className="mt-1 text-xs text-red-500">{error.message}</p>
        )}
    </div>
);

// ── Input class helper ────────────────────────────────────────────────────
const inputCls = (error) => `
    w-full px-3 py-2.5 border rounded-lg text-sm outline-none
    transition-colors
    ${error
        ? "border-red-400 focus:border-red-500 bg-red-50"
        : "border-gray-300 focus:border-blue-500"
    }
`;

export default BookForm;
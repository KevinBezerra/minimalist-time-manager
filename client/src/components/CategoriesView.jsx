import { useState } from "react";

function CategoriesView({
  categories,
  tasks,
  error,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
}) {
  const [categoryName, setCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [draftName, setDraftName] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      const added = await onAddCategory(categoryName);
      if (added) setCategoryName("");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRename(event) {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      const renamed = await onRenameCategory(editingCategory, draftName);
      if (renamed) {
        setEditingCategory(null);
        setDraftName("");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(category) {
    if (!window.confirm(`Delete the "${category}" category?`)) return;
    await onDeleteCategory(category);
  }

  return (
    <div className="categories-view">
      <section className="categories-panel" aria-labelledby="add-category-heading">
        <h2 className="dashboard-panel-title" id="add-category-heading">
          Add a category
        </h2>
        <form className="category-add-form" onSubmit={handleSubmit}>
          <label htmlFor="new-category">Category name</label>
          <div className="category-add-controls">
            <input
              id="new-category"
              type="text"
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              placeholder="Enter a category"
              maxLength={40}
              required
            />
            <button className="btn-add-task" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Category"}
            </button>
          </div>
        </form>
        {error && <p className="error-text" role="alert">{error}</p>}
      </section>

      <section className="categories-panel" aria-labelledby="categories-heading">
        <h2 className="dashboard-panel-title" id="categories-heading">
          Your categories
        </h2>
        {categories.length ? (
          <ul className="category-list">
            {categories.map((category) => {
              const taskCount = tasks.filter((task) => task.category === category).length;
              return (
                <li className="category-list-item" key={category}>
                  {editingCategory === category ? (
                    <form className="category-edit-form" onSubmit={handleRename}>
                      <input
                        aria-label="Category name"
                        type="text"
                        value={draftName}
                        onChange={(event) => setDraftName(event.target.value)}
                        maxLength={40}
                        required
                        autoFocus
                      />
                      <button type="submit" disabled={isSubmitting}>
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <>
                      <span>
                        {category}
                        {taskCount > 0 && (
                          <span className="category-task-count">
                            {` (${taskCount} ${taskCount === 1 ? "task" : "tasks"})`}
                          </span>
                        )}
                      </span>
                      <div className="category-item-actions">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(category);
                            setDraftName(category);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="category-delete-button"
                          type="button"
                          disabled={taskCount > 0}
                          title={
                            taskCount > 0
                              ? "Reassign tasks before deleting this category."
                              : undefined
                          }
                          onClick={() => handleDelete(category)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="categories-empty">No categories yet.</p>
        )}
      </section>
    </div>
  );
}

export default CategoriesView;

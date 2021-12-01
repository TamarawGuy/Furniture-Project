import { editItem, getById } from '../api/data.js';
import { html, until } from '../lib.js';

const editTemplate = (itemPromise) => html`
<div class="row space-top">
    <div class="col-md-12">
        <h1>Edit Furniture</h1>
        <p>Please fill all fields.</p>
    </div>
    ${until(itemPromise, html`<p>Loading &hellip;</p>`)}
</div>`;

const formTemplate = (item, onSubmit, errorMsg, errors) => html`
<form @submit=${onSubmit}>
    <div class="row space-top">
        <div class="col-md-4">
            <div class="form-group">
                <label class="form-control-label" for="new-make">Make</label>
                <input class="form-control" id="new-make" type="text" name="make" .value=${item.make}>
            </div>
            <div class="form-group has-success">
                <label class="form-control-label" for="new-model">Model</label>
                <input class="form-control is-valid" id="new-model" type="text" name="model" .value=${item.model}>
            </div>
            <div class="form-group has-danger">
                <label class="form-control-label" for="new-year">Year</label>
                <input class="form-control is-invalid" id="new-year" type="number" name="year" .value=${item.year}>
            </div>
            <div class="form-group">
                <label class="form-control-label" for="new-description">Description</label>
                <input class="form-control" id="new-description" type="text" name="description"
                    .value=${item.description}>
            </div>
        </div>
        <div class="col-md-4">
            <div class="form-group">
                <label class="form-control-label" for="new-price">Price</label>
                <input class="form-control" id="new-price" type="number" name="price" .value=${item.price}>
            </div>
            <div class="form-group">
                <label class="form-control-label" for="new-image">Image</label>
                <input class="form-control" id="new-image" type="text" name="img" .value=${item.img}>
            </div>
            <div class="form-group">
                <label class="form-control-label" for="new-material">Material (optional)</label>
                <input class="form-control" id="new-material" type="text" name="material" .value=${item.material}>
            </div>
            <input type="submit" class="btn btn-info" value="Edit" />
        </div>
    </div>
</form>`;

export function editPage(ctx) {
    const itemPromise = getById(ctx.params.id);
    update(null, {});

    function update(errorMsg, errors) {
        ctx.render(editTemplate(loadItem(itemPromise)));
    }

    async function loadItem(itemPromise) {
        const item = await itemPromise;

        return formTemplate(item, onSubmit, '', {});
    }

    async function onSubmit(event) {
        event.preventDefault();

        const formData = new FormData(event.target);

        const make = formData.get('make').trim();
        const model = formData.get('model').trim();
        let year = formData.get('year').trim();
        const description = formData.get('description').trim();
        let price = formData.get('price').trim();
        const img = formData.get('img').trim();
        const material = formData.get('material').trim();

        try {
            if (make == '' || model == '' || year == '' || description == '' || price == '' || img == '') {
                throw {
                    error: new Error('Please fill all mandatory fields!'),
                    errors: {}
                }
            }

            if (make.length < 4 || model.length < 4) {
                throw {
                    error: new Error('Field should be at least 4 chars'),
                    errors: {
                        make: make.length < 4,
                        model: model.length < 4
                    }
                }
            }

            year = Number(year);
            price = Number(price);

            if (year < 1950 || year > 2050) {
                throw {
                    error: new Error('Year must be between 1950 and 2050'),
                    errors: {
                        year: year < 1950 || year > 2050
                    }
                }
            }

            if (description.length < 10) {
                throw {
                    error: new Error('Description must be at least 10 chars'),
                    errors: {
                        description: description.length < 10
                    }
                }
            }

            if (price < 0) {
                throw {
                    error: new Error('Price must be a positive number'),
                    errors: {
                        price: price < 0
                    }
                }
            }

            const item = {
                make,
                model,
                year,
                description,
                price,
                img,
                material
            };

            await editItem(ctx.params.id, item);
            event.target.reset();
            ctx.page.redirect('/');
        }

        catch (err) {
            const message = err.message || err.error.message;
            update(message, err.errors);
        }
    }
}


import { useState } from 'react';
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay';
import { IconSearch } from '../../components/common/Icons';

const ExploreFood = () => {
  const [category, setCategory] = useState('All');
  const [searchText, setSearchText] = useState('');

  return (
    <>
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-7">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="input-group">
                <select
                  className="form-select"
                  style={{ maxWidth: '140px' }}
                  onChange={(e) => setCategory(e.target.value)}
                  value={category}
                >
                  <option value="All">All Categories</option>
                  <option value="Biryani">Biryani</option>
                  <option value="Pizza">Pizza</option>
                  <option value="Burger">Burger</option>
                  <option value="Pasta">Pasta</option>
                  <option value="Salad">Salad</option>
                  <option value="Rolls">Rolls</option>
                  <option value="Ice Creames">Ice Creams</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Cake">Cake</option>
                </select>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search dishes or cuisines..."
                  onChange={(e) => setSearchText(e.target.value)}
                  value={searchText}
                />
                <button className="btn btn-dark d-flex align-items-center px-3" type="submit">
                  <IconSearch size={15} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <FoodDisplay category={category} searchText={searchText} />
    </>
  );
};

export default ExploreFood;
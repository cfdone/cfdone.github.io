import Navbar from '../components/Navbar';
import logo from '../assets/logo.svg';

function UniHub() {
  return (
    <div className="fixed inset-0 bg-black">
      {/* Background decoration - same as other pages */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-48 h-48 bg-accent/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-10 w-64 h-64 bg-purple-500/2 rounded-full blur-3xl"></div>
      </div>

      <div className="flex flex-col h-full relative z-10">
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-4 pt-12 max-w-md mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-product-sans text-white text-2xl font-semibold mb-1">Faculty Members</h1>
              <p className="text-accent font-product-sans">Department of Computational Fluid Dynamics</p>
            </div>
            <img src={logo} alt="" className="h-10 w-10" />
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto no-scrollbar p-4 max-w-md mx-auto text-white">
            {/* Faculty Categories */}
            <div className="space-y-6 mb-20">
              {/* Professors & HODs */}
              <div>
                <h2 className="text-white/50 text-xs font-product-sans uppercase tracking-wider mb-3 px-2">
                  Professors & HODs
                </h2>
                <div className="grid grid-cols-1 gap-2">
                  <div className="bg-white/5 p-4 rounded-xl border border-accent/10 flex">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
                      <img 
                        src="https://cfd.nu.edu.pk/wp-content/uploads/2022/01/Profile-Pic-235x300.jpg" 
                        alt="Dr. Muhammad Fayyaz" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-base mb-1">Dr. Muhammad Fayyaz</h4>
                      <h6 className="text-accent text-sm mb-2">Associate Professor & HOD</h6>
                      <div className="text-white/70 text-sm">
                        <p>m.fayyaz@nu.edu.pk</p>
                        <span className="inline-block bg-accent/20 text-accent text-xs py-1 px-2 rounded mt-2">HEC approved PhD Supervisor</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-accent/10 flex">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
                      <img 
                        src="https://cfd.nu.edu.pk/wp-content/uploads/2019/09/PSX_20240307_194751-1-1-235x300.jpg" 
                        alt="Dr. Muhammad Shahzad" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-base mb-1">Dr. Muhammad Shahzad</h4>
                      <h6 className="text-accent text-sm mb-2">Professor</h6>
                      <div className="text-white/70 text-sm">
                        <p>shahzad.sarfraz@nu.edu.pk</p>
                        <span className="inline-block bg-accent/20 text-accent text-xs py-1 px-2 rounded mt-2">HEC approved PhD Supervisor</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Associate Professors */}
              <div>
                <h2 className="text-white/50 text-xs font-product-sans uppercase tracking-wider mb-3 px-2">
                  Associate Professors
                </h2>
                <div className="grid grid-cols-1 gap-2">
                  <div className="bg-white/5 p-4 rounded-xl border border-accent/10 flex">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
                      <img 
                        src="https://cfd.nu.edu.pk/wp-content/uploads/2025/02/Dr.-Ammar-Rafiq-235x300.jpeg" 
                        alt="Dr. Ammar Rafiq" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-base mb-1">Dr. Ammar Rafiq</h4>
                      <h6 className="text-accent text-sm mb-2">Associate Professor</h6>
                      <div className="text-white/70 text-sm">
                        <p>ammar.rafiq@nu.edu.pk</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-accent/10 flex">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
                      <img 
                        src="https://cfd.nu.edu.pk/wp-content/uploads/2020/09/5994-1-e1678168158795-235x300.png" 
                        alt="Dr. Muhammad Umar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-base mb-1">Dr. Muhammad Umar</h4>
                      <h6 className="text-accent text-sm mb-2">Associate Professor</h6>
                      <div className="text-white/70 text-sm">
                        <p>umar.aftab@nu.edu.pk</p>
                        <span className="inline-block bg-accent/20 text-accent text-xs py-1 px-2 rounded mt-2">HEC approved PhD Supervisor</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-accent/10 flex">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
                      <img 
                        src="https://cfd.nu.edu.pk/wp-content/uploads/2022/08/Dr-Usama-235x300.jpg" 
                        alt="Dr. Usama Khalid" 
                        className="w-full h-full object-cover"
                      />

                      <div className="text-white/70 text-sm">
                        <p>rabia.maqsood@nu.edu.pk</p>
                        <span className="inline-block bg-accent/20 text-accent text-xs py-1 px-2 rounded mt-2">HEC approved PhD Supervisor</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lecturers */}
              <div>
                <h2 className="text-white/50 text-xs font-product-sans uppercase tracking-wider mb-3 px-2">
                  Lecturers
                </h2>
                <div className="grid grid-cols-1 gap-2">
                  <div className="bg-white/5 p-4 rounded-xl border border-accent/10 flex">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
                      <img 
                        src="https://cfd.nu.edu.pk/wp-content/uploads/2023/08/IMG_6685-235x300.jpg" 
                        alt="Mr. Ali Hamza" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-base mb-1">Mr. Ali Hamza</h4>
                      <h6 className="text-accent text-sm mb-2">Lecturer</h6>
                      <div className="text-white/70 text-sm">
                        <p>ali.Hamza@nu.edu.pk</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-accent/10 flex">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
                      <img 
                        src="https://cfd.nu.edu.pk/wp-content/uploads/2021/08/Mr.-Ali-Raza-scaled-e1689926748189-235x300.jpg" 
                        alt="Mr. Ali Raza" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-base mb-1">Mr. Ali Raza</h4>
                      <h6 className="text-accent text-sm mb-2">Lecturer</h6>
                      <div className="text-white/70 text-sm">
                        <p>aliraza@nu.edu.pk</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-accent/10 flex">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
                      <img 
                        src="https://cfd.nu.edu.pk/wp-content/uploads/2019/09/5652-235x300.png" 
                        alt="Ms. Aliza Saeed" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-base mb-1">Ms. Aliza Saeed</h4>
                      <h6 className="text-accent text-sm mb-2">Lecturer</h6>
                      <div className="text-white/70 text-sm">
                        <p>aliza.saeed@nu.edu.pk</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-accent/10 flex">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
                      <img 
                        src="https://cfd.nu.edu.pk/wp-content/uploads/2020/10/Ayesha-Liaqat-235x300.jpg" 
                        alt="Ms. Ayesha Liaqat" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-base mb-1">Ms. Ayesha Liaqat</h4>
                      <h6 className="text-accent text-sm mb-2">Lecturer</h6>
                      <div className="text-white/70 text-sm">
                        <p>ayesha.liaqat@nu.edu.pk</p>
                        <span className="inline-block bg-amber-500/20 text-amber-500 text-xs py-1 px-2 rounded mt-2">On Leave</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructors */}
              <div>
                <h2 className="text-white/50 text-xs font-product-sans uppercase tracking-wider mb-3 px-2">
                  Instructors
                </h2>
                <div className="grid grid-cols-1 gap-2">
                  <div className="bg-white/5 p-4 rounded-xl border border-accent/10 flex">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
                      <img 
                        src="https://cfd.nu.edu.pk/wp-content/uploads/2025/08/Ms-Alisha-Abid-235x295.png" 
                        alt="Ms. Alisha Abid" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-base mb-1">Ms. Alisha Abid</h4>
                      <h6 className="text-accent text-sm mb-2">Instructor</h6>
                      <div className="text-white/70 text-sm">
                        <p>alisha.abid@nu.edu.pk</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 p-4 rounded-xl border border-accent/10 flex">
                    <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
                      <img 
                        src="https://cfd.nu.edu.pk/wp-content/uploads/2024/01/Ms-Amna-Waheed-235x300.jpg" 
                        alt="Ms. Amna Waheed" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-base mb-1">Ms. Amna Waheed</h4>
                      <h6 className="text-accent text-sm mb-2">Instructor</h6>
                      <div className="text-white/70 text-sm">
                        <p>Amna.Waheed@nu.edu.pk</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Navbar */}
        <div className="flex-shrink-0 flex justify-center px-4">
          <Navbar currentPage="unihub" />
        </div>
      </div>
    </div>
  );
}

export default UniHub;
